const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Actual removeDiacritics logic from lib/utils/normalize.ts (mimicked)
function removeDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Mimic addPatient logic from src/actions/patients.ts
async function addPatientMimic(data) {
  const nameNormalized = removeDiacritics(data.name);
  console.log(`[Mimic] Checking for: "${nameNormalized}" | DOB: "${data.dob}"`);
  
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('name_normalized', nameNormalized)
    .eq('dob', data.dob || '')
    .maybeSingle();

  if (existing) {
    console.log(`[Mimic] Patient exists with ID: ${existing.id}. Updating...`);
    return { ...existing, status: 'updated' };
  }

  console.log(`[Mimic] Patient does not exist. Inserting...`);
  return { status: 'inserted' };
}

async function verify() {
  console.log('--- Verifying Phase 02 Logic ---');

  // 1. Get primary patient details
  const { data: patients } = await supabase
    .from('patients')
    .select('id, name, name_normalized, dob')
    .ilike('name', '%Tùng Lâm%');

  if (patients && patients.length > 0) {
    const p = patients[0];
    console.log(`Found primary patient: ${p.name} (ID: ${p.id}) | Normalized: ${p.name_normalized}`);

    // 2. Test addPatient mimic
    console.log('\nTesting addPatient logic...');
    const result = await addPatientMimic({
      name: p.name,
      dob: p.dob,
      phone: 'test-upsert',
    });

    if (result.status === 'updated' && result.id === p.id) {
      console.log('✅ PASS: addPatient logic correctly identified existing patient.');
    } else {
      console.log('❌ FAIL: addPatient logic failed to identify existing patient.');
    }
  }
}

verify().catch(console.error);
