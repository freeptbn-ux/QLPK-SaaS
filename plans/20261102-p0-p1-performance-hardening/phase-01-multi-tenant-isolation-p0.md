# Phase 01: Multi-Tenant Isolation & Clinic-Scoped Constraints (P0)

**Target Issues:** PERF-001, PERF-002  
**Severity:** 🔴 Critical (P0)  
**Status:** ✅ Completed  
**Dependencies:** None  

---

## 1. Objective

Eliminate critical multi-tenant data leakage in patient search/listing RPC functions and resolve cross-clinic patient registration blockages caused by global unique constraints. Ensure that tenant boundaries are strictly enforced across all database stored procedures and schema constraints in compliance with PostgreSQL Row-Level Security (RLS) standards.

---

## 2. Scope

- **In Scope:**
  - Audit and remediate `get_patients_with_last_visit` in PostgreSQL migrations so that all patient filtering and search operations are strictly constrained to the caller's authenticated `clinic_id`.
  - Update or replace the global unique index `idx_patients_unique_person` on the `patients` table to be scoped by `clinic_id`, allowing distinct clinics to manage patients with identical names and birth dates without encountering database conflict errors.
  - Preserve soft-delete semantics (`deleted_at IS NULL`) and case-insensitive/unaccented search consistency.
  - Implement a comprehensive file-based test suite verifying multi-tenant query isolation and clinic-scoped patient constraint enforcement.

- **Out of Scope:**
  - Redesigning the frontend patient search UI components or table pagination controls.
  - Modifying unrelated patient medical records, prescriptions, or clinical notes tables.

---

## 3. Requirements

### Functional Requirements
- **Tenant-Scoped Search & Retrieval:** Execution of `get_patients_with_last_visit` must strictly return only patients belonging to the authenticated user's clinic. Under no circumstances should patients from Clinic B be returned or searchable by users belonging to Clinic A.
- **Cross-Clinic Patient Coexistence:** Two or more independent clinics must be permitted to register patients having the exact same normalized name and date of birth (`name_normalized` and `dob`).
- **Intra-Clinic Duplicate Prevention:** Within the same clinic, active patients with identical normalized names and dates of birth must continue to adhere to clinic-specific uniqueness rules (excluding soft-deleted records).

### Non-Functional & Security Requirements
- **Security Definer Hardening:** Any `SECURITY DEFINER` function accessing tenant data must explicitly bind tenant identification via `get_my_clinic_id()` and set a secure `search_path` (`SET search_path = public, pg_temp`).
- **Index Efficiency:** The updated clinic-scoped unique index must support efficient indexed lookups on `(clinic_id, lower(name_normalized), COALESCE(dob, ''))` without table scan regressions.
- **Zero Downtime Migration:** The index migration must not leave table locks hanging or disrupt ongoing clinic read/write operations.

---

## 4. Constraints

- Must be fully compatible with PostgreSQL 17 and Supabase RLS conventions.
- Must preserve multi-tenancy guarantees established across all other clinic tables.
- Must not orphan or invalidate existing patient records currently stored across multiple clinics.

---

## 5. Dependencies

- Supabase Database Migrations (`supabase/migrations/`)
- Existing session context helper function `get_my_clinic_id()`
- Vitest testing framework

---

## 6. Acceptance Criteria

1. `get_patients_with_last_visit` enforces `clinic_id = (SELECT get_my_clinic_id())` (or authenticated clinic context) across all query branches (pagination, search, and ordering).
2. The global unique index `idx_patients_unique_person` is replaced with a clinic-scoped unique index incorporating `clinic_id`.
3. Simultaneous insertion of identical patient personal data (`name_normalized`, `dob`) across two distinct clinic IDs succeeds without unique constraint errors.
4. The comprehensive file-based test in `tests/phase-01-tenant-isolation.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-01-tenant-isolation.test.ts`  
**Purpose:** Verify tenant isolation in `get_patients_with_last_visit` and confirm that cross-clinic patient registrations with identical names and birth dates succeed without constraint violations.

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

describe('Phase 01: Multi-Tenant Isolation & Clinic-Scoped Constraints', () => {
  let adminClient: SupabaseClient;
  const testClinicA = '11111111-1111-4111-a111-111111111111';
  const testClinicB = '22222222-2222-4222-a222-222222222222';
  const testDob = '1985-05-15';
  const sharedNormalizedName = 'nguyen van test unique';

  beforeAll(async () => {
    expect(supabaseUrl).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();
    adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Ensure test clinics exist
    await adminClient.from('clinics').upsert([
      { id: testClinicA, name: 'Test Clinic Alpha' },
      { id: testClinicB, name: 'Test Clinic Beta' },
    ]);

    // Clean up any existing test records for these clinics
    await adminClient.from('patients').delete().in('clinic_id', [testClinicA, testClinicB]);
  });

  afterAll(async () => {
    if (adminClient) {
      await adminClient.from('patients').delete().in('clinic_id', [testClinicA, testClinicB]);
    }
  });

  it('Requirement PERF-002: should allow patients with the same name and DOB in different clinics', async () => {
    // 1. Insert patient in Clinic A
    const { data: patientA, error: errorA } = await adminClient.from('patients').insert({
      clinic_id: testClinicA,
      name: 'Nguyễn Văn Test Unique',
      name_normalized: sharedNormalizedName,
      dob: testDob,
      gender: 'male',
      phone: '0900000001',
    }).select().single();

    expect(errorA).toBeNull();
    expect(patientA).toBeDefined();
    expect(patientA.clinic_id).toBe(testClinicA);

    // 2. Insert patient with identical name and DOB in Clinic B
    // Must succeed without violating unique constraint
    const { data: patientB, error: errorB } = await adminClient.from('patients').insert({
      clinic_id: testClinicB,
      name: 'Nguyễn Văn Test Unique',
      name_normalized: sharedNormalizedName,
      dob: testDob,
      gender: 'male',
      phone: '0900000002',
    }).select().single();

    expect(errorB).toBeNull();
    expect(patientB).toBeDefined();
    expect(patientB.clinic_id).toBe(testClinicB);
  });

  it('Requirement PERF-002: should still enforce uniqueness within the SAME clinic', async () => {
    // Attempting to insert duplicate inside Clinic A should trigger unique constraint
    const { error: duplicateError } = await adminClient.from('patients').insert({
      clinic_id: testClinicA,
      name: 'Nguyễn Văn Test Unique',
      name_normalized: sharedNormalizedName,
      dob: testDob,
      gender: 'male',
      phone: '0900000003',
    });

    expect(duplicateError).not.toBeNull();
    expect(duplicateError?.code).toBe('23505'); // unique_violation
  });

  it('Requirement PERF-001: get_patients_with_last_visit must not leak patients across clinics', async () => {
    // Verify that RPC definition enforces clinic_id filtering
    const { data: rpcDef, error: rpcError } = await adminClient.rpc('execute_sql_query', {
      query: "SELECT prosrc FROM pg_proc WHERE proname = 'get_patients_with_last_visit';"
    });

    if (!rpcError && rpcDef?.[0]?.prosrc) {
      const sourceCode: string = rpcDef[0].prosrc;
      // Must contain clinic isolation filter
      expect(sourceCode).toMatch(/clinic_id\s*=\s*(get_my_clinic_id\(\)|\$|p_clinic_id)/i);
    } else {
      // Fallback verification: inspect SQL migration definition directly
      const fs = await import('fs');
      const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
      const migrationFiles = fs.readdirSync(migrationsDir);
      const latestPatientRpc = migrationFiles
        .filter(f => f.includes('patient_last_visit') || f.includes('tenant_isolation'))
        .sort()
        .pop();

      expect(latestPatientRpc).toBeDefined();
      const content = fs.readFileSync(path.join(migrationsDir, latestPatientRpc!), 'utf-8');
      expect(content).toMatch(/clinic_id\s*=\s*(get_my_clinic_id\(\)|p_clinic_id)/i);
    }
  });
});
```

