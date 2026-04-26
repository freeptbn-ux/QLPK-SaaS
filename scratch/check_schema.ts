import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('medicines').select('*').limit(1);
  if (error) {
    console.error('Error fetching medicines:', error);
  } else {
    console.log('Medicine columns:', Object.keys(data[0] || {}));
  }

  const { data: patientData, error: patientError } = await supabase.from('patients').select('*').limit(1);
  if (patientError) {
    console.error('Error fetching patients:', patientError);
  } else {
    console.log('Patient columns:', Object.keys(patientData[0] || {}));
  }
}

checkSchema();
