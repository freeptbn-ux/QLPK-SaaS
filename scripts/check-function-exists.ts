import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Dùng service key để bypass RLS/Permissions

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listFunctions() {
  console.log('--- Listing All Functions in Public Schema ---');
  
  const { data, error } = await supabase.rpc('get_stats_by_month', { p_limit: 1 }); // Just to check connection
  
  // Truy vấn trực tiếp pg_proc qua SQL (nếu được phép) hoặc dùng thông tin từ rpc
  // Vì không thể chạy SQL trực tiếp qua client dễ dàng, tôi sẽ thử gọi rpc đặc biệt
  
  const { data: functions, error: sqlError } = await supabase
    .from('pg_proc')
    .select('proname')
    .filter('pronamespace', 'eq', 2200); // 2200 usually is public schema

  if (sqlError) {
    // Nếu không select được pg_proc, ta sẽ thử check sự tồn tại của create_prescription
    console.log('Checking specifically for create_prescription...');
    const { error: rpcError } = await supabase.rpc('create_prescription', { 
      p_patient_id: 1, p_diagnosis: 'test', p_items: [], p_notes: '', p_consultation_fee: 0 
    });
    
    if (rpcError) {
      console.log('RPC Error Response:', rpcError);
    } else {
      console.log('✅ create_prescription exists and is callable with Service Key!');
    }
  } else {
    console.log('Functions found:', functions.map(f => f.proname));
  }
}

listFunctions();
