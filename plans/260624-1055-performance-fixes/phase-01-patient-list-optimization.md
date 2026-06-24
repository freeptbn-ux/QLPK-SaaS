# Phase 01: Patient List Last Visit Optimization
Status: ✅ Completed
Dependencies: None

## Objective
Optimize patient list query performance by adding a denormalized `last_visit_date` column to the `patients` table, building a composite index, and using a PostgreSQL database trigger on the `prescriptions_header` table to automatically maintain the last visit date.

## Requirements
### Functional
- Add `last_visit_date TIMESTAMPTZ` column to the `patients` table.
- Populate `last_visit_date` for all existing patients using the maximum `prescription_date` from `prescriptions_header`.
- Create a database trigger on the `prescriptions_header` table to automatically update the corresponding patient's `last_visit_date` when a prescription header is created, modified, or deleted.
- Modify the `get_patients_with_last_visit` RPC function to select the column directly from `patients` rather than performing a full table scan and aggregation.

### Non-Functional
- Add a composite index on `patients(last_visit_date DESC NULLS LAST, id DESC)` to guarantee fast sort performance for pagination.
- Ensure the trigger handles case scenarios such as changing `patient_id` on a prescription header, deleting the last prescription of a patient (which should recalculate `last_visit_date` to the previous one or NULL), and batch updates.

## Implementation Steps
1. **Create Database Migration**:
   Create a new migration file `supabase/migrations/20260624000001_optimize_patient_last_visit.sql` with the following content:
   ```sql
   -- 1. Add column to patients table
   ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMPTZ;

   -- 2. Backfill existing patient data
   UPDATE public.patients p
   SET last_visit_date = (
     SELECT MAX(ph.prescription_date)
     FROM public.prescriptions_header ph
     WHERE ph.patient_id = p.id
   );

   -- 3. Create composite index for sorting
   CREATE INDEX IF NOT EXISTS idx_patients_last_visit_sorting 
   ON public.patients (last_visit_date DESC NULLS LAST, id DESC);

   -- 4. Create trigger function to sync last_visit_date
   CREATE OR REPLACE FUNCTION update_patient_last_visit_date()
   RETURNS TRIGGER AS $$
   BEGIN
     IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
       UPDATE public.patients
       SET last_visit_date = (
         SELECT MAX(prescription_date)
         FROM public.prescriptions_header
         WHERE patient_id = NEW.patient_id
       )
       WHERE id = NEW.patient_id;
       
       IF TG_OP = 'UPDATE' AND OLD.patient_id <> NEW.patient_id THEN
         UPDATE public.patients
         SET last_visit_date = (
           SELECT MAX(prescription_date)
           FROM public.prescriptions_header
           WHERE patient_id = OLD.patient_id
         )
         WHERE id = OLD.patient_id;
       END IF;
     ELSIF TG_OP = 'DELETE' THEN
       UPDATE public.patients
       SET last_visit_date = (
         SELECT MAX(prescription_date)
         FROM public.prescriptions_header
         WHERE patient_id = OLD.patient_id
       )
       WHERE id = OLD.patient_id;
     END IF;
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- 5. Attach the trigger
   DROP TRIGGER IF EXISTS trg_update_patient_last_visit ON public.prescriptions_header;
   CREATE TRIGGER trg_update_patient_last_visit
   AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions_header
   FOR EACH ROW EXECUTE FUNCTION update_patient_last_visit_date();

   -- 6. Refactor RPC get_patients_with_last_visit
   CREATE OR REPLACE FUNCTION get_patients_with_last_visit(
     p_search_term TEXT DEFAULT NULL,
     p_search_normalized TEXT DEFAULT NULL,
     p_limit INT DEFAULT 50,
     p_offset INT DEFAULT 0
   )
   RETURNS TABLE (
     id BIGINT,
     name TEXT,
     dob TEXT,
     gender TEXT,
     address TEXT,
     phone TEXT,
     weight TEXT,
     medical_history TEXT,
     diagnosis TEXT,
     created_at TIMESTAMPTZ,
     name_normalized TEXT,
     updated_at TIMESTAMPTZ,
     clinic_id BIGINT,
     last_visit_date TIMESTAMPTZ,
     total_count BIGINT
   )
   LANGUAGE sql
   STABLE
   SECURITY DEFINER
   AS $$
     WITH filtered_patients AS (
       SELECT p.*
       FROM public.patients p
       WHERE (
         p_search_term IS NULL 
         OR p_search_term = '' 
         OR p.name_normalized ILIKE '%' || p_search_normalized || '%'
         OR p.phone ILIKE '%' || p_search_term || '%'
       )
     )
     SELECT 
       fp.id,
       fp.name,
       fp.dob,
       fp.gender,
       fp.address,
       fp.phone,
       fp.weight,
       fp.medical_history,
       fp.diagnosis,
       fp.created_at,
       fp.name_normalized,
       fp.updated_at,
       fp.clinic_id,
       fp.last_visit_date,
       COUNT(*) OVER() AS total_count
     FROM filtered_patients fp
     ORDER BY fp.last_visit_date DESC NULLS LAST, fp.id DESC
     LIMIT p_limit
     OFFSET p_offset;
   $$;
   ```

2. **Verify Server Actions Integration**:
   Ensure `src/actions/patients.ts` handles the updated pagination sorting seamlessly.

## Files to Create/Modify
- [NEW] [20260624000001_optimize_patient_last_visit.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/supabase/migrations/20260624000001_optimize_patient_last_visit.sql)
- [NEW] [verify-patient-list-optimization.test.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/tests/verify-patient-list-optimization.test.ts)
- [NEW] [verify_patient_list_optimization.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/tests/verify_patient_list_optimization.sql)

## Detailed File-Based Tests

### 1. Database-Level Tests
We will create `tests/verify_patient_list_optimization.sql` to execute in the database to verify RLS, triggers, and RPC queries:

```sql
-- tests/verify_patient_list_optimization.sql
BEGIN;

-- 1. Setup mock patient and clinic
INSERT INTO public.clinics (id, name) VALUES (9999, 'Test Clinic') ON CONFLICT DO NOTHING;
INSERT INTO public.patients (id, name, clinic_id) VALUES (99991, 'Patient A', 9999), (99992, 'Patient B', 9999);

-- 2. Verify column exists
SELECT count(*) = 2 AS column_exists 
FROM information_schema.columns 
WHERE table_name = 'patients' AND column_name = 'last_visit_date';

-- 3. Insert prescription and verify trigger updates last_visit_date
INSERT INTO public.prescriptions_header (id, patient_id, prescription_date, clinic_id)
VALUES (999901, 99991, '2026-06-24 10:00:00+07', 9999);

SELECT last_visit_date = '2026-06-24 10:00:00+07'::timestamptz AS last_visit_updated_on_insert
FROM public.patients WHERE id = 99991;

-- 4. Update prescription date and verify trigger adjusts last_visit_date
UPDATE public.prescriptions_header
SET prescription_date = '2026-06-24 12:00:00+07'
WHERE id = 999901;

SELECT last_visit_date = '2026-06-24 12:00:00+07'::timestamptz AS last_visit_updated_on_update
FROM public.patients WHERE id = 99991;

-- 5. Delete prescription and verify last_visit_date becomes NULL (since there are no other prescriptions)
DELETE FROM public.prescriptions_header WHERE id = 999901;

SELECT last_visit_date IS NULL AS last_visit_null_on_delete
FROM public.patients WHERE id = 99991;

-- 6. Verify RPC results and structure
SELECT id, name, last_visit_date 
FROM get_patients_with_last_visit('Patient A', 'patient a', 10, 0);

ROLLBACK;
```

### 2. Node.js/Vitest Tests
We will create `tests/verify-patient-list-optimization.test.ts` to assert that server actions query `get_patients_with_last_visit` and pass required parameters:

```typescript
// tests/verify-patient-list-optimization.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientsPaginated, searchPatients } from '../src/actions/patients';
import { getAuthUser } from '../src/lib/supabase/auth';

vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Patient List Last Visit Optimization', () => {
  const mockSupabase: any = {
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as any).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      supabase: mockSupabase 
    });
  });

  it('should request patients list via get_patients_with_last_visit RPC in getPatientsPaginated', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await getPatientsPaginated({ page: 1, limit: 10 });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', expect.objectContaining({
      p_limit: 10,
      p_offset: 0
    }));
  });

  it('should use search terms in searchPatients with get_patients_with_last_visit RPC', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await searchPatients('John');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', expect.objectContaining({
      p_search_term: 'John',
      p_search_normalized: 'john'
    }));
  });
});
```

---
Next Phase: [Phase 02: Medicine Usage Statistics RPC](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/plans/260624-1055-performance-fixes/phase-02-medicine-usage-rpc.md)
