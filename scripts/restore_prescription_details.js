const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

async function restore() {
  console.log("--- Starting Prescription Details Restoration ---");

  // 1. Fetch reference medicines
  const { data: medicines, error: medError } = await supabase
    .from("medicines")
    .select("id, name, packing_spec, price, clinic_id");
  if (medError) throw medError;

  const medMapExact = new Map();
  const medMapNoAccents = new Map();
  medicines.forEach((m) => {
    medMapExact.set(m.name.toLowerCase().trim(), m);
    medMapNoAccents.set(removeAccents(m.name), m);
  });

  const aliases = {
    "xịt họng bee clean": "keo ong bee clean - xịt họng",
    "delopedil deslora": "delopedil 30ml",
    "test drug a f9010fdd": null,
  };

  function findMed(rawName) {
    const clean = rawName.toLowerCase().trim();
    if (aliases[clean] !== undefined) {
      if (!aliases[clean]) return null;
      return medMapExact.get(aliases[clean]);
    }
    if (medMapExact.has(clean)) return medMapExact.get(clean);

    const noAcc = removeAccents(clean);
    if (medMapNoAccents.has(noAcc)) return medMapNoAccents.get(noAcc);

    for (const [k, m] of medMapExact.entries()) {
      if (clean.startsWith(k) || k.startsWith(clean)) return m;
    }
    for (const [k, m] of medMapNoAccents.entries()) {
      if (noAcc.startsWith(k) || k.startsWith(noAcc)) return m;
    }
    return null;
  }

  // 2. Fetch history logs
  const { data: logs, error: logError } = await supabase
    .from("patient_history_logs")
    .select("prescription_id, patient_id, clinic_id, medical_history_snapshot")
    .not("medical_history_snapshot", "is", null);
  if (logError) throw logError;

  const detailsToInsert = [];
  const seenKey = new Set();

  for (const log of logs) {
    if (!log.prescription_id) continue;
    const lines = log.medical_history_snapshot.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*\d+[\)\.]\s*(.*?)\s*x\s*(\d+)(.*)$/i);
      if (match) {
        const drugName = match[1].trim();
        const quantity = parseInt(match[2].trim(), 10) || 1;
        const rest = match[3] ? match[3].trim() : "";
        const med = findMed(drugName);
        if (med) {
          const key = `${log.prescription_id}_${med.id}`;
          if (!seenKey.has(key)) {
            seenKey.add(key);
            detailsToInsert.push({
              prescription_header_id: log.prescription_id,
              medicine_id: med.id,
              quantity: quantity,
              unit_price: med.price || 0,
              dosage: rest || null,
            });
          }
        }
      }
    }
  }

  // 3. Fetch legacy patient medical_history for patients without logs
  const { data: patients, error: patientError } = await supabase
    .from("patients")
    .select("id, name, medical_history")
    .not("medical_history", "is", null);
  if (patientError) throw patientError;

  const logPatients = new Set(logs.map((l) => l.patient_id));
  const { data: headers, error: headerError } = await supabase
    .from("prescriptions_header")
    .select("id, patient_id")
    .order("id", { ascending: false });
  if (headerError) throw headerError;

  const headersByPatient = new Map();
  headers.forEach((h) => {
    if (!headersByPatient.has(h.patient_id)) headersByPatient.set(h.patient_id, []);
    headersByPatient.get(h.patient_id).push(h);
  });

  for (const p of patients) {
    if (!p.medical_history || logPatients.has(p.id)) continue;
    const pHeaders = headersByPatient.get(p.id) || [];
    if (pHeaders.length === 0) continue;
    const targetHeader = pHeaders[0];

    const lines = p.medical_history.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*\d+[\)\.]\s*(.*?)\s*x\s*(\d+)(.*)$/i);
      if (match) {
        const drugName = match[1].trim();
        const quantity = parseInt(match[2].trim(), 10) || 1;
        const rest = match[3] ? match[3].trim() : "";
        const med = findMed(drugName);
        if (med) {
          const key = `${targetHeader.id}_${med.id}`;
          if (!seenKey.has(key)) {
            seenKey.add(key);
            detailsToInsert.push({
              prescription_header_id: targetHeader.id,
              medicine_id: med.id,
              quantity: quantity,
              unit_price: med.price || 0,
              dosage: rest || null,
            });
          }
        }
      }
    }
  }

  console.log(`Parsed ${detailsToInsert.length} prescription details rows to insert.`);

  // 4. Batch insert into prescription_details
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < detailsToInsert.length; i += batchSize) {
    const chunk = detailsToInsert.slice(i, i + batchSize);
    const { error: insertErr } = await supabase
      .from("prescription_details")
      .insert(chunk);

    if (insertErr) {
      console.error(`Error inserting chunk ${i}-${i + chunk.length}:`, insertErr);
      throw insertErr;
    }
    inserted += chunk.length;
    process.stdout.write(`Inserted ${inserted}/${detailsToInsert.length} rows...\r`);
  }

  console.log(`\nSuccessfully restored ${inserted} records into prescription_details!`);

  // 5. Verify total count
  const { count } = await supabase
    .from("prescription_details")
    .select("*", { count: "exact", head: true });
  console.log(`Current total rows in prescription_details: ${count}`);
}

restore().catch((err) => {
  console.error("Restoration failed:", err);
  process.exit(1);
});

