# Phase 02: Medicine Usage Statistics RPC
Status: ✅ Completed
Dependencies: None

## Objective
Offload patient-specific medicine usage statistical calculations (grouping, counting, sorting) from application memory (JavaScript) to PostgreSQL by introducing a database RPC function `get_medicine_usage_by_patient`.

## Requirements
### Functional
- Create `get_medicine_usage_by_patient` database RPC function accepting `p_patient_id BIGINT`.
- Ensure multi-tenant isolation: the RPC must enforce security check `clinic_id = get_my_clinic_id()` for patient, prescription header, and medicine.
- Group the prescription details by `medicine_id`, returning: `medicine_id`, `medicine_name`, `packing_spec`, and `times_prescribed` (as count).
- Order the result set descending by `times_prescribed`.
- Modify `getMedicineUsageByPatient` in `src/actions/patients.ts` to invoke the Supabase RPC rather than fetching all details and grouping in memory.

### Non-Functional
- Eliminate unnecessary memory usage and reduce network payload for patients with long prescription histories.

## Implementation Steps
1. **Create Database Migration**:
   Create a new migration file `supabase/migrations/20260624000002_create_medicine_usage_rpc.sql` with the following content:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_medicine_usage_by_patient(p_patient_id BIGINT)
   RETURNS TABLE (
     medicine_id BIGINT,
     medicine_name TEXT,
     packing_spec TEXT,
     times_prescribed BIGINT
   )
   LANGUAGE plpgsql
   STABLE
   SECURITY DEFINER
   AS $$
   DECLARE
     v_clinic_id BIGINT;
   BEGIN
     -- Get caller's clinic_id
     v_clinic_id := get_my_clinic_id();
     
     -- Verify patient clinic ownership
     IF NOT EXISTS (
       SELECT 1 FROM public.patients 
       WHERE id = p_patient_id AND clinic_id = v_clinic_id
     ) THEN
       RETURN;
     END IF;

     RETURN QUERY
     SELECT 
       pd.medicine_id,
       m.name AS medicine_name,
       m.packing_spec,
       COUNT(*)::BIGINT AS times_prescribed
     FROM public.prescription_details pd
     JOIN public.prescriptions_header ph ON pd.prescription_header_id = ph.id
     JOIN public.medicines m ON pd.medicine_id = m.id
     WHERE ph.patient_id = p_patient_id
       AND ph.clinic_id = v_clinic_id
       AND m.clinic_id = v_clinic_id
     GROUP BY pd.medicine_id, m.name, m.packing_spec
     ORDER BY times_prescribed DESC;
   END;
   $$;
   
   -- Grant execute permissions to authenticated users
   GRANT EXECUTE ON FUNCTION public.get_medicine_usage_by_patient(BIGINT) TO authenticated;
   ```

2. **Refactor Server Action**:
   Modify `src/actions/patients.ts`:
   ```typescript
   export async function getMedicineUsageByPatient(patientId: number) {
     const { supabase } = await getAuthUser();

     const { data, error } = await supabase.rpc('get_medicine_usage_by_patient', {
       p_patient_id: patientId
     });

     if (error) {
       console.error('Error fetching medicine usage RPC:', error);
       return [];
     }

     return data || [];
   }
   ```

## Files to Create/Modify
- [NEW] [20260624000002_create_medicine_usage_rpc.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/supabase/migrations/20260624000002_create_medicine_usage_rpc.sql)
- [MODIFY] [patients.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/actions/patients.ts)
- [NEW] [verify-medicine-usage-rpc.test.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/tests/verify-medicine-usage-rpc.test.ts)
- [NEW] [verify_medicine_usage_rpc.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/tests/verify_medicine_usage_rpc.sql)

## Detailed File-Based Tests

### 1. Database-Level Tests
Create `tests/verify_medicine_usage_rpc.sql` to verify aggregation count accuracy and multi-tenancy access controls:

```sql
-- tests/verify_medicine_usage_rpc.sql
BEGIN;

-- 1. Setup mock data
INSERT INTO public.clinics (id, name) VALUES (9999, 'Test Clinic'), (9998, 'Other Clinic') ON CONFLICT DO NOTHING;
INSERT INTO public.patients (id, name, clinic_id) VALUES (99991, 'Patient A', 9999), (99981, 'Patient B', 9998);
INSERT INTO public.medicines (id, name, clinic_id) VALUES (999901, 'Med A', 9999), (999902, 'Med B', 9999);

-- Insert prescriptions headers
INSERT INTO public.prescriptions_header (id, patient_id, clinic_id) VALUES 
(999901, 99991, 9999), 
(999902, 99991, 9999);

-- Insert details: Med A prescribed twice, Med B once
INSERT INTO public.prescription_details (prescription_header_id, medicine_id, quantity) VALUES
(999901, 999901, 1),
(999901, 999902, 2),
(999902, 999901, 1);

-- Mock JWT claim/claims context for security definer function testing
-- Note: set local role to authenticated and clinic_id claim to 9999
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
SET LOCAL request.jwt.claims TO '{"role":"authenticated", "user_metadata":{"clinic_id":9999}}';

-- 2. Verify counts are grouped and calculated correctly (Med A: 2, Med B: 1)
SELECT count(*) = 2 AS correct_row_count FROM public.get_medicine_usage_by_patient(99991);
SELECT times_prescribed = 2 AS med_a_count FROM public.get_medicine_usage_by_patient(99991) WHERE medicine_id = 999901;
SELECT times_prescribed = 1 AS med_b_count FROM public.get_medicine_usage_by_patient(99991) WHERE medicine_id = 999902;

-- 3. Verify cross-tenant isolation (should return empty results for patient from clinic 9998)
SELECT count(*) = 0 AS restricted_cross_tenant FROM public.get_medicine_usage_by_patient(99981);

ROLLBACK;
```

### 2. Node.js/Vitest Tests
Create `tests/verify-medicine-usage-rpc.test.ts` to test integration with the server action:

```typescript
// tests/verify-medicine-usage-rpc.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMedicineUsageByPatient } from '../src/actions/patients';
import { getAuthUser } from '../src/lib/supabase/auth';

vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Medicine Usage RPC Integration', () => {
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

  it('should call get_medicine_usage_by_patient database RPC and return parsed data', async () => {
    const mockOutput = [
      { medicine_id: 1, medicine_name: 'Paracetamol', packing_spec: 'Vỉ', times_prescribed: 5 }
    ];
    mockSupabase.rpc.mockResolvedValue({ data: mockOutput, error: null });

    const result = await getMedicineUsageByPatient(123);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_medicine_usage_by_patient', {
      p_patient_id: 123
    });
    expect(result).toEqual(mockOutput);
  });

  it('should return empty array and log error on RPC failure', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Database Error') });

    const result = await getMedicineUsageByPatient(123);

    expect(result).toEqual([]);
  });
});
```

---
Next Phase: [Phase 03: AI Dosage Cache & Hook Fix](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/plans/260624-1055-performance-fixes/phase-03-ai-dosage-cache.md)
