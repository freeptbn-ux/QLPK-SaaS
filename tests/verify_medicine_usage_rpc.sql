-- tests/verify_medicine_usage_rpc.sql
BEGIN;

-- Disable triggers to insert test data with custom clinic IDs
ALTER TABLE public.patients DISABLE TRIGGER tr_set_clinic_id_patients;
ALTER TABLE public.prescriptions_header DISABLE TRIGGER tr_set_clinic_id_prescriptions;
ALTER TABLE public.prescriptions_header DISABLE TRIGGER trg_sync_clinic_daily_stats;
ALTER TABLE public.medicines DISABLE TRIGGER tr_set_clinic_id_medicines;

-- 1. Setup mock data
INSERT INTO public.clinics (id, name) VALUES (9999, 'Test Clinic'), (9998, 'Other Clinic') ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, clinic_id, role, full_name) 
VALUES 
  ('77777777-7777-7777-7777-777777777777', 9999, 'admin', 'Admin A'),
  ('66666666-6666-6666-6666-666666666666', 9998, 'admin', 'Admin B')
ON CONFLICT (id) DO UPDATE SET clinic_id = EXCLUDED.clinic_id;

INSERT INTO public.patients (id, name, clinic_id, dob, gender, phone) VALUES 
(99991, 'Patient A', 9999, '01/01/1990', 'Nam', '0999999991'), 
(99981, 'Patient B', 9998, '02/02/1990', 'Nữ', '0999999992');

INSERT INTO public.medicines (id, name, clinic_id) VALUES 
(999901, 'Med A', 9999), 
(999902, 'Med B', 9999);

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
-- Note: set local role to authenticated and sub claim for Admin A (Clinic 9999)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
SET LOCAL "request.jwt.claims" = '{"sub": "77777777-7777-7777-7777-777777777777", "role": "authenticated"}';

-- 2. Verify everything in a single row
SELECT 
  (SELECT count(*) = 2 FROM public.get_medicine_usage_by_patient(99991)) AS correct_row_count,
  (SELECT times_prescribed = 2 FROM public.get_medicine_usage_by_patient(99991) WHERE medicine_id = 999901) AS med_a_count,
  (SELECT times_prescribed = 1 FROM public.get_medicine_usage_by_patient(99991) WHERE medicine_id = 999902) AS med_b_count,
  (SELECT count(*) = 0 FROM public.get_medicine_usage_by_patient(99981)) AS restricted_cross_tenant;

-- Enable triggers back
ALTER TABLE public.patients ENABLE TRIGGER tr_set_clinic_id_patients;
ALTER TABLE public.prescriptions_header ENABLE TRIGGER tr_set_clinic_id_prescriptions;
ALTER TABLE public.prescriptions_header ENABLE TRIGGER trg_sync_clinic_daily_stats;
ALTER TABLE public.medicines ENABLE TRIGGER tr_set_clinic_id_medicines;

ROLLBACK;
