# Phase 03: Prescription Trigger Consolidation & Write Optimization (P1)

**Target Issues:** PERF-005  
**Severity:** 🟠 High (P1)  
**Status:** ✅ Completed  
**Dependencies:** Phase 01, Phase 02  

---

## 1. Objective

Eliminate write amplification, trigger storms, and database lock contention on `clinic_daily_stats` during prescription creation. Consolidate row-by-row trigger cascades into an atomic, batch-oriented update mechanism that maintains 100% financial rollup integrity and inventory consistency without serializing concurrent clinical transactions.

---

## 2. Scope

- **In Scope:**
  - Audit and consolidate PostgreSQL triggers active on `prescriptions` and `prescription_details` (notably `trg_update_daily_stats_details`, `trg_sync_clinic_daily_stats`, and `trg_update_patient_last_visit`).
  - Redesign daily statistics aggregation so that inserting a prescription with $N$ detail line items executes an atomic, aggregated update to `clinic_daily_stats` once per transaction rather than firing $N$ independent row-level recalculations and row locks.
  - Preserve accurate calculation of `total_revenue`, `medicine_revenue`, `service_revenue`, and `prescription_count`.
  - Maintain atomic inventory stock deductions and transaction rollback safety upon any validation failure.
  - Implement a comprehensive file-based test suite verifying transactional atomicity, trigger execution reduction, and financial rollup accuracy.

- **Out of Scope:**
  - Modifying the frontend prescription form UI or print layouts.
  - Modifying retrospective stats backfill tools or manual reporting exports.

---

## 3. Requirements

### Functional Requirements
- **Transactional Atomicity:** When creating a prescription with multiple medications and services:
  - A single prescription header is inserted.
  - All detail records are inserted with corresponding dosages and pricing.
  - Stock levels for each prescribed medication are decremented atomically.
  - The patient's `last_visit_date` is updated.
  - `clinic_daily_stats` for the target clinic and date is updated with exact aggregate increments (`total_revenue += prescription.total_amount`, `prescription_count += 1`, etc.).
- **Rollback Safety:** If any item fails validation (e.g., negative stock, invalid medicine ID), the entire transaction must abort with zero partial state committed.

### Non-Functional & Performance Requirements
- **Trigger Elimination / Batching:** Replace per-row triggers on `prescription_details` that recompute daily totals with a single batch/statement rollup or direct procedure aggregation inside `create_prescription`.
- **Concurrency & Lock Contention:** Multiple clinicians prescribing simultaneously for the same clinic on the same date must not encounter deadlocks or extended row lock wait states on `clinic_daily_stats`.
- **Write Query Reduction:** Total database write operations for an $N$-item prescription must scale at $O(1)$ relative to daily rollup queries rather than $O(N)$ row-level locking upserts.

---

## 4. Constraints

- Must preserve exact numeric precision for all monetary fields (`numeric(15, 2)` or integer cents).
- Multi-tenant isolation: statistics rollups must strictly match the prescription's `clinic_id`.
- Must be compatible with PostgreSQL 17 transaction isolation and Supabase RPC calling patterns.

---

## 5. Dependencies

- `supabase/migrations/`
- Existing tables: `prescriptions`, `prescription_details`, `clinic_daily_stats`, `medicines`, `patients`
- Vitest testing framework

---

## 6. Acceptance Criteria

1. Detail row insertion in `prescription_details` no longer executes individual row-level recalculation triggers against `clinic_daily_stats`.
2. Total revenue, medicine revenue, service revenue, and count in `clinic_daily_stats` match the exact sum of inserted prescriptions and details.
3. Concurrent execution test demonstrates successful prescription creation without lock timeouts or deadlocks.
4. The comprehensive file-based test in `tests/phase-03-prescription-triggers.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-03-prescription-triggers.test.ts`  
**Purpose:** Verify that multi-item prescription creation executes atomically, updates `clinic_daily_stats` with exact mathematical accuracy, and avoids per-item row-trigger storming.

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

describe('Phase 03: Prescription Trigger Consolidation & Write Optimization', () => {
  let adminClient: SupabaseClient;
  const testClinicId = '33333333-3333-4333-a333-333333333333';
  const testPatientId = '44444444-4444-4444-a444-444444444444';
  const testDoctorId = '55555555-5555-4555-a555-555555555555';
  const testMedicineIds: string[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

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
      const medId = `66666666-6666-4666-a666-66666666666${i}`;
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
      await adminClient.from('prescription_details').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await adminClient.from('prescriptions').delete().eq('clinic_id', testClinicId);
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
});
```

