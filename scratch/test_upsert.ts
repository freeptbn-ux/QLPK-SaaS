import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('upsert_patient', {
    p_name: 'Test Patient',
    p_name_normalized: 'test patient',
    p_dob: '1990',
    p_gender: 'Nam',
    p_phone: '0123456789',
    p_address: 'Test Address',
    p_diagnosis: '',
    p_weight: '',
    p_medical_history: '',
  });

  console.log('Result:', data);
  console.log('Error:', error);
}

test();
