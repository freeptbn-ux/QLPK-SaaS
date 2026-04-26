const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeletePrescription() {
  console.log('🚀 Starting detailed test for delete_prescription RPC...');

  try {
    // 1. Create a test patient
    const { data: patient, error: pErr } = await supabase
      .from('patients')
      .insert({ 
        name: 'TEST PATIENT DELETE', 
        phone: '0000000000',
        dob: '01/01/2000',
        gender: 'Nam'
      })
      .select()
      .single();
    
    if (pErr) throw pErr;
    console.log(`✅ Created test patient: ID ${patient.id}`);

    // 2. Create a test medicine
    const medicineName = `TEST MEDICINE ${Date.now()}`;
    const initialStock = 100;
    const { data: medicine, error: mErr } = await supabase
      .from('medicines')
      .insert({ 
        name: medicineName, 
        stock_quantity: initialStock,
        price: 1000
      })
      .select()
      .single();
    
    if (mErr) throw mErr;
    console.log(`✅ Created test medicine: ${medicineName}, Stock: ${initialStock}`);

    // 3. Create a prescription using the create_prescription RPC
    // This will deduct stock automatically
    const quantityToPrescribe = 10;
    const { data: headerId, error: rpcErr } = await supabase.rpc('create_prescription', {
      p_patient_id: patient.id,
      p_diagnosis: 'TEST DIAGNOSIS',
      p_items: [
        {
          medicine_id: medicine.id,
          medicine_name: medicineName,
          quantity: quantityToPrescribe,
          unit_price: 1000,
          packing_spec: 'Viên'
        }
      ],
      p_notes: 'Test deletion',
      p_consultation_fee: 30000
    });

    if (rpcErr) throw rpcErr;
    console.log(`✅ Created prescription: ID ${headerId}`);

    // 4. Verify stock was deducted
    const { data: medAfter, error: mErr2 } = await supabase
      .from('medicines')
      .select('stock_quantity')
      .eq('id', medicine.id)
      .single();
    
    console.log(`📊 Stock after prescription: ${medAfter.stock_quantity} (Expected: ${initialStock - quantityToPrescribe})`);
    if (medAfter.stock_quantity !== initialStock - quantityToPrescribe) {
      throw new Error('Stock deduction failed!');
    }

    // 5. Call the new delete_prescription RPC
    console.log('🗑️ Calling delete_prescription RPC...');
    const { error: delErr } = await supabase.rpc('delete_prescription', {
      p_prescription_id: headerId
    });

    if (delErr) throw delErr;
    console.log('✅ RPC executed successfully');

    // 6. Verify stock was restored
    const { data: medRestored, error: mErr3 } = await supabase
      .from('medicines')
      .select('stock_quantity')
      .eq('id', medicine.id)
      .single();
    
    console.log(`📊 Stock after deletion: ${medRestored.stock_quantity} (Expected: ${initialStock})`);
    if (medRestored.stock_quantity !== initialStock) {
      throw new Error('Stock restoration failed!');
    }

    // 7. Verify prescription and details are gone
    const { data: headerCheck } = await supabase
      .from('prescriptions_header')
      .select('id')
      .eq('id', headerId)
      .maybeSingle();
    
    if (headerCheck) {
      throw new Error('Prescription header still exists!');
    }
    console.log('✅ Prescription header deleted');

    const { data: detailsCheck } = await supabase
      .from('prescription_details')
      .select('id')
      .eq('prescription_header_id', headerId);
    
    if (detailsCheck && detailsCheck.length > 0) {
      throw new Error('Prescription details still exist!');
    }
    console.log('✅ Prescription details deleted (cascaded)');

    // 8. Verify patient diagnosis update (should be null or empty as it was the only one)
    const { data: patientAfter } = await supabase
      .from('patients')
      .select('diagnosis')
      .eq('id', patient.id)
      .single();
    
    console.log(`📋 Patient diagnosis after deletion: "${patientAfter.diagnosis || ''}"`);

    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');

    // Clean up
    await supabase.from('medicines').delete().eq('id', medicine.id);
    await supabase.from('patients').delete().eq('id', patient.id);
    console.log('🧹 Cleaned up test data');

  } catch (err) {
    console.error('❌ TEST FAILED:', err.message || err);
    process.exit(1);
  }
}

testDeletePrescription();
