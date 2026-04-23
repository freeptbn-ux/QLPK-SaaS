import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
console.log('Supabase client initialized');

async function testUsage() {
  console.log('Starting testUsage...');
  try {
    // Find a patient with at least one prescription
    console.log('Fetching a prescription header...');
    const { data: header, error: headerError } = await supabase
      .from('prescriptions_header')
      .select('patient_id')
      .limit(1)
      .single();

    if (headerError) {
      console.error('Error fetching header:', headerError);
    }

    if (!header) {
      console.log('No prescriptions found in DB. Cannot test positive case.');
      await testWithPatient(999999);
      return;
    }

    const patientId = header.patient_id;
    console.log(`Testing with Patient ID: ${patientId}`);
    await testWithPatient(patientId);
    
    console.log('\nTesting with Non-existent Patient ID: 999999');
    await testWithPatient(999999);
  } catch (err) {
    console.error('Catch error in testUsage:', err);
  }
}

async function testWithPatient(patientId: number) {
  console.log(`Querying usage for patient: ${patientId}...`);
  try {
    const { data, error } = await supabase
      .from('prescription_details')
      .select(`
        medicine_id,
        medicines(name, packing_spec),
        prescriptions_header!inner(patient_id)
      `)
      .eq('prescriptions_header.patient_id', patientId);

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    console.log(`Raw items found: ${data?.length || 0}`);

    const usageMap = new Map<number, { medicine_name: string; packing_spec: string; times_prescribed: number }>();
    
    for (const item of data || []) {
      const id = item.medicine_id;
      const medicine = item.medicines as any;
      
      const existing = usageMap.get(id);
      if (existing) {
        existing.times_prescribed += 1;
      } else {
        usageMap.set(id, {
          medicine_name: medicine?.name || 'Không rõ',
          packing_spec: medicine?.packing_spec || '',
          times_prescribed: 1,
        });
      }
    }

    const results = Array.from(usageMap.values())
      .sort((a, b) => b.times_prescribed - a.times_prescribed);

    console.log('Aggregated Results:');
    console.table(results);
  } catch (err) {
    console.error('Error in testWithPatient:', err);
  }
}

testUsage().then(() => console.log('Test finished')).catch(e => console.error('Final catch:', e));
