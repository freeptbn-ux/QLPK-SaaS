import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRPCs() {
  console.log('--- Testing RPC Permissions ---');
  
  const rpcs = [
    { name: 'get_low_stock_count', args: {} },
    { name: 'get_distinct_months_years', args: {} },
    { name: 'get_stats_by_month', args: { p_limit: 1 } },
    { name: 'create_prescription', args: { p_patient_id: 1, p_diagnosis: 'test', p_items: [], p_notes: '', p_consultation_fee: 0 } }
  ];

  for (const rpc of rpcs) {
    console.log(`Testing RPC: ${rpc.name}...`);
    const { data, error } = await supabase.rpc(rpc.name, rpc.args);
    
    if (error) {
      if (error.message.includes('Could not find the function')) {
        console.error(`❌ ${rpc.name}: FAILED - Function not found in schema cache (Permission issue)`);
      } else if (error.code === '23505' || error.message.includes('violates unique constraint')) {
        console.log(`✅ ${rpc.name}: SUCCESS - Function is accessible (Stopped by data constraint as expected)`);
      } else {
        console.error(`❌ ${rpc.name}: FAILED - ${error.message} (Code: ${error.code})`);
      }
    } else {
      console.log(`✅ ${rpc.name}: SUCCESS - Data received:`, data);
    }
  }
}

testRPCs();
