-- tests/verify_patient_list_optimization.sql
BEGIN;

-- Disable clinic_id triggers for testing inserts
ALTER TABLE public.patients DISABLE TRIGGER tr_set_clinic_id_patients;
ALTER TABLE public.prescriptions_header DISABLE TRIGGER tr_set_clinic_id_prescriptions;
ALTER TABLE public.prescriptions_header DISABLE TRIGGER trg_sync_clinic_daily_stats;

-- 1. Setup mock patient and clinic
INSERT INTO public.clinics (id, name) VALUES (9999, 'Test Clinic') ON CONFLICT DO NOTHING;
INSERT INTO public.patients (id, name, clinic_id, dob, gender, phone) 
VALUES 
  (99991, 'Patient A', 9999, '01/01/1990', 'Nam', '0999999991'), 
  (99992, 'Patient B', 9999, '02/02/1990', 'Nữ', '0999999992');

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

-- Enable them back (though we're rolling back, it's good practice)
ALTER TABLE public.patients ENABLE TRIGGER tr_set_clinic_id_patients;
ALTER TABLE public.prescriptions_header ENABLE TRIGGER tr_set_clinic_id_prescriptions;
ALTER TABLE public.prescriptions_header ENABLE TRIGGER trg_sync_clinic_daily_stats;

ROLLBACK;
