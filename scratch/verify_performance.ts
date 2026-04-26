import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('--- Bắt đầu kiểm tra Performance và Flow ---');

  // 1. Thêm bệnh nhân mới (Functional Flow - Patient CRUD)
  console.log('\n1. Test: Thêm bệnh nhân (Upsert RPC)');
  const startAdd = performance.now();
  const { data: addResult, error: addError } = await supabase.rpc('upsert_patient', {
    p_name: 'Nguyễn Văn Kiểm Tra',
    p_name_normalized: 'nguyen van kiem tra',
    p_dob: '1990-10-20',
    p_gender: 'Nam',
    p_phone: '0123456789',
    p_address: 'Hà Nội',
    p_diagnosis: 'Sốt',
    p_weight: '65',
    p_medical_history: ''
  });
  const endAdd = performance.now();
  if (addError) {
    console.error('Lỗi khi thêm bệnh nhân:', addError);
  } else {
    console.log(`✅ Đã thêm bệnh nhân. Thời gian: ${(endAdd - startAdd).toFixed(2)}ms`);
    console.log('Kết quả:', addResult);
  }

  // 2. Tìm kiếm bệnh nhân với Trigram Index (Performance)
  console.log('\n2. Test: Tìm kiếm bệnh nhân (Trigram ILIKE)');
  const startSearch = performance.now();
  const { data: searchResult, error: searchError } = await supabase
    .from('patients')
    .select('id, name')
    .or('name_normalized.ilike.%nguyen%,phone.ilike.%0123%')
    .limit(5);
  const endSearch = performance.now();
  if (searchError) {
    console.error('Lỗi khi tìm kiếm:', searchError);
  } else {
    console.log(`✅ Tìm kiếm hoàn tất. Thời gian: ${(endSearch - startSearch).toFixed(2)}ms`);
    console.log(`Tìm thấy ${searchResult.length} kết quả.`);
  }

  // 3. Đếm số lượng bệnh nhân (Performance)
  console.log('\n3. Test: Đếm tổng số bệnh nhân');
  const startCount = performance.now();
  const { count, error: countError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });
  const endCount = performance.now();
  if (countError) {
    console.error('Lỗi khi đếm:', countError);
  } else {
    console.log(`✅ Đếm hoàn tất. Tổng số: ${count}. Thời gian: ${(endCount - startCount).toFixed(2)}ms`);
  }

  // 4. Kiểm tra RPC get_stats_by_month
  console.log('\n4. Test: RPC get_stats_by_month(12)');
  const startStats = performance.now();
  const { data: statsData, error: statsError } = await supabase.rpc('get_stats_by_month', { p_limit: 12 });
  const endStats = performance.now();
  if (statsError) {
    console.error('Lỗi khi lấy stats by month:', statsError);
  } else {
    console.log(`✅ Lấy stats by month hoàn tất. Thời gian: ${(endStats - startStats).toFixed(2)}ms`);
  }

  // 5. Kiểm tra RPC get_medicine_usage_stats
  console.log('\n5. Test: RPC get_medicine_usage_stats(NULL)');
  const startMed = performance.now();
  const { data: medData, error: medError } = await supabase.rpc('get_medicine_usage_stats');
  const endMed = performance.now();
  if (medError) {
    console.error('Lỗi khi lấy medicine usage:', medError);
  } else {
    console.log(`✅ Lấy medicine usage hoàn tất. Thời gian: ${(endMed - startMed).toFixed(2)}ms`);
  }

  // 6. Kiểm tra RPC get_monthly_revenue_total
  console.log('\n6. Test: RPC get_monthly_revenue_total');
  const startRev = performance.now();
  const { data: revData, error: revError } = await supabase.rpc('get_monthly_revenue_total');
  const endRev = performance.now();
  if (revError) {
    console.error('Lỗi khi lấy revenue:', revError);
  } else {
    console.log(`✅ Lấy revenue hoàn tất. Giá trị: ${revData}. Thời gian: ${(endRev - startRev).toFixed(2)}ms`);
  }

  console.log('\n--- Hoàn tất kiểm tra ---');
}

runTests();
