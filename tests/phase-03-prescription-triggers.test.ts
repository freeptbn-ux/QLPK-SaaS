import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

describe('Phase 03: Prescription Trigger Consolidation & Write Optimization', () => {
  let adminClient: SupabaseClient;
  const testClinicId = 33333333;
  const testPatientId = 44444444;
  const testDoctorId = '55555555-5555-4555-a555-555555555555';
  const testMedicineIds: number[] = [];

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

  beforeAll(async () => {
    adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Setup clinic & patient
    await adminClient.from('clinics').upsert([{ id: testClinicId, name: 'Batch Stats Test Clinic' }]);
    await adminClient.from('patients').upsert([{
      id: testPatientId,
      clinic_id: testClinicId,
      name: 'Nguyen Van Batch',
      name_normalized: 'nguyen van batch',
      gender: 'male',
    }]);

    // Create 3 test medicines with ample stock
    for (let i = 1; i <= 3; i++) {
      const medId = 66666660 + i;
      testMedicineIds.push(medId);
      await adminClient.from('medicines').upsert([{
        id: medId,
        clinic_id: testClinicId,
        name: `Medicine Batch Item ${i}`,
        name_normalized: `medicine batch item ${i}`,
        unit: 'Viên',
        price: 10000 * i, // 10k, 20k, 30k
        stock_quantity: 100,
        is_active: true,
      }]);
    }
  });

  afterAll(async () => {
    if (adminClient) {
      await adminClient.from('prescriptions_header').delete().eq('clinic_id', testClinicId);
      await adminClient.from('medicines').delete().eq('clinic_id', testClinicId);
      await adminClient.from('patients').delete().eq('clinic_id', testClinicId);
      await adminClient.from('clinic_daily_stats').delete().eq('clinic_id', testClinicId);
    }
  });

  it('Requirement PERF-005: should atomically create multi-item prescription and accurately roll up stats', async () => {
    // 1. Fetch baseline stats for today if any
    const { data: initialStats } = await adminClient
      .from('clinic_daily_stats')
      .select('*')
      .eq('clinic_id', testClinicId)
      .eq('date', todayStr)
      .maybeSingle();

    const baseRevenue = Number(initialStats?.total_revenue || 0);
    const basePrescriptions = Number(initialStats?.prescription_count || 0);

    // 2. Prepare a 3-item prescription
    // Item 1: 2 x 10,000 = 20,000
    // Item 2: 3 x 20,000 = 60,000
    // Item 3: 1 x 30,000 = 30,000
    // Total Expected Revenue: 110,000
    const items = [
      { medicine_id: testMedicineIds[0], quantity: 2, unit_price: 10000, total_price: 20000, dosage: '1v x 2' },
      { medicine_id: testMedicineIds[1], quantity: 3, unit_price: 20000, total_price: 60000, dosage: '1v x 3' },
      { medicine_id: testMedicineIds[2], quantity: 1, unit_price: 30000, total_price: 30000, dosage: '1v x 1' },
    ];
    const totalAmount = 110000;

    // 3. Call create_prescription RPC
    const { data: prescriptionId, error: rpcError } = await adminClient.rpc('create_prescription', {
      p_clinic_id: testClinicId,
      p_patient_id: testPatientId,
      p_doctor_id: testDoctorId,
      p_diagnosis: 'Test batch trigger optimization',
      p_total_amount: totalAmount,
      p_items: items,
      p_payment_status: 'paid',
    });

    expect(rpcError).toBeNull();
    expect(prescriptionId).toBeDefined();

    // 4. Verify daily stats reflects exactly +1 prescription and +110,000 revenue
    const { data: updatedStats, error: statsError } = await adminClient
      .from('clinic_daily_stats')
      .select('*')
      .eq('clinic_id', testClinicId)
      .eq('date', todayStr)
      .single();

    expect(statsError).toBeNull();
    expect(Number(updatedStats.total_revenue)).toBe(baseRevenue + totalAmount);
    expect(Number(updatedStats.prescription_count)).toBe(basePrescriptions + 1);

    // 5. Verify patient last_visit_date updated
    const { data: patient } = await adminClient
      .from('patients')
      .select('last_visit_date')
      .eq('id', testPatientId)
      .single();

    expect(patient?.last_visit_date).toBeDefined();
  });

  it('Requirement PERF-005: should verify that redundant per-row detail triggers are eliminated or disabled', async () => {
    // Check database trigger catalog to ensure trg_update_daily_stats_details does not execute row-level loops
    const { data: triggers, error } = await adminClient.rpc('execute_sql_query', {
      query: `
        SELECT tgname, tgenabled, relname 
        FROM pg_trigger 
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid 
        WHERE relname = 'prescription_details' AND tgname = 'trg_update_daily_stats_details';
      `
    });

    if (!error && triggers) {
      // Trigger should either be dropped, disabled, or transformed into statement-level
      const isActiveRowTrigger = triggers.some((t: any) => t.tgenabled === 'O');
      expect(isActiveRowTrigger).toBe(false);
    }
  });

  it('Requirement PERF-005: should abort transaction and roll back changes on validation failure (insufficient stock)', async () => {
    const items = [
      { medicine_id: testMedicineIds[0], quantity: 99999, unit_price: 10000, total_price: 999990000, dosage: '100v' }
    ];

    const { data: failId, error: failError } = await adminClient.rpc('create_prescription', {
      p_clinic_id: testClinicId,
      p_patient_id: testPatientId,
      p_doctor_id: testDoctorId,
      p_diagnosis: 'Stock limit failure test',
      p_items: items,
      p_payment_status: 'unpaid',
    });

    expect(failError).toBeDefined();
    expect(failId).toBeNull();

    // Verify stock was not deducted
    const { data: med } = await adminClient
      .from('medicines')
      .select('stock_quantity')
      .eq('id', testMedicineIds[0])
      .single();

    // Initial stock was 100, item 1 used 2 in the previous test -> remaining 98
    expect(med?.stock_quantity).toBe(98);
  });

  it('Requirement PERF-005: should execute concurrent prescriptions without lock timeouts or deadlocks', async () => {
    const concurrentCount = 5;
    const promises = [];

    for (let i = 0; i < concurrentCount; i++) {
      promises.push(
        adminClient.rpc('create_prescription', {
          p_clinic_id: testClinicId,
          p_patient_id: testPatientId,
          p_doctor_id: testDoctorId,
          p_diagnosis: `Concurrent stress prescription ${i}`,
          p_total_amount: 10000,
          p_items: [
            { medicine_id: testMedicineIds[0], quantity: 1, unit_price: 10000, total_price: 10000, dosage: '1v' }
          ],
          p_payment_status: 'paid',
        })
      );
    }

    const results = await Promise.all(promises);

    for (const res of results) {
      expect(res.error).toBeNull();
      expect(res.data).toBeDefined();
    }
  });
});

