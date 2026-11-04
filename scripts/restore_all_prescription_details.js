const cp = require("child_process");
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

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`=== RESTORING PRESCRIPTION DETAILS (DRY RUN: ${isDryRun}) ===\n`);

  // 1. Fetch medicines for name lookup & price
  const { data: medicines, error: medError } = await supabase
    .from("medicines")
    .select("id, name, price, packing_spec, clinic_id");
  if (medError) throw medError;

  const medMapExact = new Map();
  const medMapNoAccents = new Map();
  const medById = new Map();

  medicines.forEach((m) => {
    medById.set(m.id, m);
    medMapExact.set(m.name.toLowerCase().trim(), m);
    medMapNoAccents.set(removeAccents(m.name), m);
  });

  const aliases = {
    "xịt họng bee clean": "keo ong bee clean - xịt họng",
    "delopedil deslora": "delopedil 30ml",
    "kamitagel": "kamistad - gel n",
    "cefdinir 125": "cefdinir 125 dhg",
    "cefdinir 125mg": "cefdinir 125 dhg",
    "augixine 250": "augixine 250mg",
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

  // 2. Fetch all existing prescriptions_header
  const { data: headers, error: headerError } = await supabase
    .from("prescriptions_header")
    .select("id, patient_id, diagnosis, total_amount, consultation_fee, prescription_date");
  if (headerError) throw headerError;
  const headerMap = new Map(headers.map((h) => [h.id, h]));
  console.log(`Loaded ${headers.length} prescription headers.`);

  // 3. Fetch all currently existing prescription_details (with pagination)
  let existingDetails = [];
  let page = 0;
  while (true) {
    const { data: chunk, error: detErr } = await supabase
      .from("prescription_details")
      .select("id, prescription_header_id, medicine_id")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (detErr) throw detErr;
    if (!chunk || chunk.length === 0) break;
    existingDetails.push(...chunk);
    page++;
  }
  console.log(`Currently in DB: ${existingDetails.length} prescription_details rows.`);

  const seenKey = new Set(
    existingDetails.map((d) => `${d.prescription_header_id}_${d.medicine_id}`)
  );

  const itemsToInsert = [];

  // 4. Source A: Historical git dump (headers <= 818)
  console.log("\nReading historical SQL dump from git...");
  const sqlDump = cp
    .execSync(
      'git show 0fbdc5c4cd71b855901b3c06d174caeba2f46542:"Supabase Database/prescription_details_rows.sql"',
      { maxBuffer: 10 * 1024 * 1024 }
    )
    .toString();

  const sqlMatches = [
    ...sqlDump.matchAll(/\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d\.]+)\)/g),
  ];
  console.log(`Found ${sqlMatches.length} raw rows in historical SQL dump.`);

  let sqlAdded = 0;
  for (const m of sqlMatches) {
    const pId = parseInt(m[2], 10);
    const mId = parseInt(m[3], 10);
    const qty = parseInt(m[4], 10);
    const unitPrice = parseFloat(m[5]);

    if (!headerMap.has(pId)) continue; // Header no longer exists
    if (!medById.has(mId)) continue; // Medicine doesn't exist

    const key = `${pId}_${mId}`;
    if (!seenKey.has(key)) {
      seenKey.add(key);
      itemsToInsert.push({
        prescription_header_id: pId,
        medicine_id: mId,
        quantity: qty,
        unit_price: unitPrice,
        dosage: null,
      });
      sqlAdded++;
    }
  }
  console.log(`Source A added: ${sqlAdded} rows.`);

  // 5. Source B: patient_history_logs (supports both \n and \\n)
  console.log("\nReading patient_history_logs...");
  const { data: logs, error: logError } = await supabase
    .from("patient_history_logs")
    .select("id, prescription_id, patient_id, medical_history_snapshot")
    .not("medical_history_snapshot", "is", null);
  if (logError) throw logError;

  let logAdded = 0;
  for (const log of logs) {
    if (!log.prescription_id || !headerMap.has(log.prescription_id)) continue;
    const lines = log.medical_history_snapshot.split(/\\n|\n/);
    for (const line of lines) {
      const match = line.match(/^\s*\d+[\)\.]\s*(.*?)\s*x\s*(\d+)(.*)$/i);
      if (match) {
        const drugName = match[1].trim();
        const qty = parseInt(match[2].trim(), 10) || 1;
        const rest = match[3] ? match[3].replace(/[\\/]+$/, '').trim() : "";
        const med = findMed(drugName);
        if (med) {
          const key = `${log.prescription_id}_${med.id}`;
          if (!seenKey.has(key)) {
            seenKey.add(key);
            itemsToInsert.push({
              prescription_header_id: log.prescription_id,
              medicine_id: med.id,
              quantity: qty,
              unit_price: med.price || 0,
              dosage: rest || null,
            });
            logAdded++;
          }
        }
      }
    }
  }
  console.log(`Source B added: ${logAdded} rows.`);

  // 6. Source C: Intermediate headers (819 to 888) from patients.medical_history
  console.log("\nReading intermediate headers from patients.medical_history...");
  // Group headers missing details by patient_id
  const headersNeedingDetails = headers.filter(
    (h) => h.id > 818 && h.id < 20899 && ![...seenKey].some((k) => k.startsWith(`${h.id}_`))
  );

  const patientIds = [...new Set(headersNeedingDetails.map((h) => h.patient_id))];
  const { data: patients, error: patErr } = await supabase
    .from("patients")
    .select("id, name, medical_history")
    .in("id", patientIds);
  if (patErr) throw patErr;

  const patMap = new Map(patients.map((p) => [p.id, p]));
  let patHistAdded = 0;

  for (const h of headersNeedingDetails) {
    const p = patMap.get(h.patient_id);
    if (!p || !p.medical_history || !/1\)/.test(p.medical_history)) continue;

    const lines = p.medical_history.split(/\\n|\n/);
    for (const line of lines) {
      const match = line.match(/^\s*\d+[\)\.]\s*(.*?)\s*x\s*(\d+)(.*)$/i);
      if (match) {
        const drugName = match[1].trim();
        const qty = parseInt(match[2].trim(), 10) || 1;
        const rest = match[3] ? match[3].replace(/[\\/]+$/, '').trim() : "";
        const med = findMed(drugName);
        if (med) {
          const key = `${h.id}_${med.id}`;
          if (!seenKey.has(key)) {
            seenKey.add(key);
            itemsToInsert.push({
              prescription_header_id: h.id,
              medicine_id: med.id,
              quantity: qty,
              unit_price: med.price || 0,
              dosage: rest || null,
            });
            patHistAdded++;
          }
        }
      }
    }
  }
  console.log(`Source C added: ${patHistAdded} rows.`);
  console.log(`\nTOTAL ROWS READY TO INSERT: ${itemsToInsert.length}`);

  // Specifically check Patient 96 Header 830 in itemsToInsert
  const p96Items = itemsToInsert.filter((i) => i.prescription_header_id === 830);
  console.log(`\nPatient 96 Header 830 restored items (${p96Items.length}):`);
  p96Items.forEach((it) => {
    const m = medById.get(it.medicine_id);
    console.log(`  - ${m?.name} x${it.quantity} @ ${it.unit_price} (dosage: ${it.dosage})`);
  });

  if (isDryRun) {
    console.log("\n[DRY RUN] No inserts performed. Run without --dry-run to apply.");
    return;
  }

  // 7. Batch insert into prescription_details
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < itemsToInsert.length; i += batchSize) {
    const chunk = itemsToInsert.slice(i, i + batchSize);
    const { error: insertErr } = await supabase
      .from("prescription_details")
      .insert(chunk);

    if (insertErr) {
      console.error(`Error inserting chunk ${i}-${i + chunk.length}:`, insertErr);
      throw insertErr;
    }
    inserted += chunk.length;
    process.stdout.write(`Inserted ${inserted}/${itemsToInsert.length} rows...\r`);
  }

  console.log(`\n✅ Successfully inserted ${inserted} records into prescription_details!`);

  // 8. Verification
  const { count: finalCount } = await supabase
    .from("prescription_details")
    .select("*", { count: "exact", head: true });
  console.log(`Final total rows in prescription_details: ${finalCount}`);
}

main().catch((err) => {
  console.error("Restoration failed:", err);
  process.exit(1);
});
