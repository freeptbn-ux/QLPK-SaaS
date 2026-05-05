import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role to bypass RLS if needed

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRevenue() {
  console.log('--- Verifying Revenue Fix ---');

  // 1. Get current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const displayMonth = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  console.log(`Target Month: ${currentMonth}`);

  // 2. Call the RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_revenue_stats', { p_year_month: currentMonth });

  if (rpcError) {
    console.error('❌ RPC Error:', rpcError.message);
    return;
  }

  const rpcRevenue = rpcData?.find((d: any) => d.name === displayMonth)?.revenue || 0;
  console.log(`RPC Revenue for ${displayMonth}: ${rpcRevenue}`);

  // 3. Manual calculation from prescriptions_header
  const startDate = `${currentMonth}-01`;
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];

  const { data: headers, error: headerError } = await supabase
    .from('prescriptions_header')
    .select('total_amount, consultation_fee')
    .gte('prescription_date', startDate)
    .lt('prescription_date', endDate);

  if (headerError) {
    console.error('❌ Header Fetch Error:', headerError.message);
    return;
  }

  const manualTotalAmount = headers.reduce((acc, h) => acc + (h.total_amount || 0), 0);
  const manualConsultationFee = headers.reduce((acc, h) => acc + (h.consultation_fee || 0), 0);
  const buggyRevenue = manualTotalAmount + manualConsultationFee;

  console.log(`Manual SUM(total_amount): ${manualTotalAmount}`);
  console.log(`Manual SUM(consultation_fee): ${manualConsultationFee}`);
  console.log(`Buggy expected revenue: ${buggyRevenue}`);

  if (Math.abs(rpcRevenue - manualTotalAmount) < 0.01) {
    console.log('✅ SUCCESS: RPC Revenue matches SUM(total_amount).');
  } else if (Math.abs(rpcRevenue - buggyRevenue) < 0.01) {
    console.log('❌ FAILURE: RPC Revenue still includes double-counted consultation_fee.');
  } else {
    console.log('⚠️ UNKNOWN: RPC Revenue matches neither. Check if migration was applied.');
  }
}

verifyRevenue();
