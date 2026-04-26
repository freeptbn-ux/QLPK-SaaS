import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdatePrescription() {
  console.log('🧪 Bắt đầu test RPC update_prescription...');

  // 1. Chuẩn bị data: Patient, Medicine
  const { data: patient } = await supabase
    .from('patients')
    .insert({ name: 'Test Patient', phone: '0987654321' })
    .select()
    .single();

  const { data: medicine } = await supabase
    .from('medicines')
    .insert({ 
      name: 'Test Medicine', 
      stock_quantity: 100, 
      unit: 'Viên', 
      price: 1000,
      packing_spec: 'Vỉ 10 viên'
    })
    .select()
    .single();

  if (!patient || !medicine) {
    console.error('❌ Không thể tạo data mẫu');
    return;
  }

  console.log(`✅ Đã tạo Patient ID: ${patient.id}, Medicine ID: ${medicine.id}`);

  // 2. Tạo Prescription ban đầu
  const { data: header } = await supabase
    .from('prescriptions_header')
    .insert({
      patient_id: patient.id,
      diagnosis: 'Cảm cúm',
      consultation_fee: 50000,
      total_amount: 60000, // 50k fee + 10 items * 1k
      prescription_date: new Date().toISOString()
    })
    .select()
    .single();

  await supabase
    .from('prescription_details')
    .insert({
      prescription_header_id: header.id,
      medicine_id: medicine.id,
      quantity: 10,
      unit_price: 1000
    });

  // Trừ kho thủ công cho case tạo mới (giả sử hệ thống hiện tại làm vậy)
  await supabase
    .from('medicines')
    .update({ stock_quantity: 90 })
    .eq('id', medicine.id);

  console.log(`✅ Đã tạo đơn thuốc ID: ${header.id}`);

  // 3. Gọi RPC update_prescription
  console.log('🚀 Gọi RPC update_prescription...');
  const newItems = [
    {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      quantity: 5, // Đổi từ 10 thành 5 -> Kho phải tăng thêm 5
      unit_price: 1000,
      packing_spec: medicine.packing_spec
    }
  ];

  const { error: rpcError } = await supabase.rpc('update_prescription', {
    p_prescription_id: header.id,
    p_diagnosis: 'Viêm họng',
    p_notes: 'Uống sau ăn',
    p_prescription_date: new Date().toISOString(),
    p_items: newItems
  });

  if (rpcError) {
    console.error('❌ Lỗi RPC:', rpcError);
    return;
  }

  // 4. Kiểm tra kết quả
  console.log('🔍 Kiểm tra kết quả...');

  // 4.1 Kiểm tra stock
  const { data: updatedMedicine } = await supabase
    .from('medicines')
    .select('stock_quantity')
    .eq('id', medicine.id)
    .single();

  // Ban đầu 100, trừ 10 còn 90. Update thành 5 -> (90 + 10) - 5 = 95.
  console.log(`Stock hiện tại: ${updatedMedicine.stock_quantity} (Kỳ vọng: 95)`);
  if (updatedMedicine.stock_quantity === 95) {
    console.log('✅ Stock cập nhật đúng!');
  } else {
    console.error('❌ Stock cập nhật SAI!');
  }

  // 4.2 Kiểm tra header
  const { data: updatedHeader } = await supabase
    .from('prescriptions_header')
    .select('diagnosis, notes, total_amount')
    .eq('id', header.id)
    .single();

  console.log(`Diagnosis mới: ${updatedHeader.diagnosis} (Kỳ vọng: Viêm họng)`);
  console.log(`Total amount: ${updatedHeader.total_amount} (Kỳ vọng: 55000)`); // 50k fee + 5 * 1k
  
  if (updatedHeader.diagnosis === 'Viêm họng' && updatedHeader.total_amount === 55000) {
    console.log('✅ Header cập nhật đúng!');
  } else {
    console.error('❌ Header cập nhật SAI!');
  }

  // 4.3 Kiểm tra details
  const { data: updatedDetails } = await supabase
    .from('prescription_details')
    .select('quantity')
    .eq('prescription_header_id', header.id);

  console.log(`Số lượng details: ${updatedDetails.length} (Kỳ vọng: 1)`);
  console.log(`Số lượng thuốc: ${updatedDetails[0].quantity} (Kỳ vọng: 5)`);

  if (updatedDetails.length === 1 && updatedDetails[0].quantity === 5) {
    console.log('✅ Details cập nhật đúng!');
  } else {
    console.error('❌ Details cập nhật SAI!');
  }

  // 4.4 Kiểm tra Patient
  const { data: updatedPatient } = await supabase
    .from('patients')
    .select('diagnosis, medical_history')
    .eq('id', patient.id)
    .single();

  console.log(`Patient diagnosis: ${updatedPatient.diagnosis} (Kỳ vọng: Viêm họng)`);
  if (updatedPatient.diagnosis === 'Viêm họng') {
    console.log('✅ Patient diagnosis cập nhật đúng!');
  } else {
    console.error('❌ Patient diagnosis cập nhật SAI!');
  }

  // 5. Cleanup
  console.log('🧹 Dọn dẹp data test...');
  await supabase.from('prescription_details').delete().eq('prescription_header_id', header.id);
  await supabase.from('prescriptions_header').delete().eq('id', header.id);
  await supabase.from('medicines').delete().eq('id', medicine.id);
  await supabase.from('patients').delete().eq('id', patient.id);
  console.log('✨ Xong!');
}

testUpdatePrescription();
