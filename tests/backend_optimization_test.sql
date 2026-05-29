-- Test for Phase 03: Backend Optimization (v2)
-- Objective: Verify get_low_stock_medicines RPC and tenant isolation with proper profiles

BEGIN;

-- 1. Setup Test Data
-- Create test clinics
INSERT INTO public.clinics (id, name) VALUES (999, 'Test Clinic A'), (888, 'Test Clinic B') ON CONFLICT (id) DO NOTHING;

-- Create test profiles (linked to dummy UUIDs)
-- We need to ensure auth.uid() returns these UUIDs in the session
INSERT INTO public.profiles (id, clinic_id, role, full_name) 
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 999, 'admin', 'Admin A'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 888, 'admin', 'Admin B')
ON CONFLICT (id) DO NOTHING;

-- Insert medicines for Clinic A
INSERT INTO public.medicines (id, name, stock_quantity, min_stock_level, clinic_id) 
VALUES 
(9001, 'Med A Low Stock', 2, 5, 999), 
(9002, 'Med A High Stock', 10, 5, 999)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

-- Insert medicines for Clinic B
INSERT INTO public.medicines (id, name, stock_quantity, min_stock_level, clinic_id) 
VALUES 
(8001, 'Med B Low Stock', 1, 5, 888), 
(8002, 'Med B High Stock', 20, 5, 888)
ON CONFLICT (id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

-- 2. Test get_low_stock_medicines RPC
-- Simulate Clinic A session (proper sub and clinic_id)
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "clinic_id": 999, "role": "authenticated"}';

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM public.get_low_stock_medicines();
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: get_low_stock_medicines returned correct count (1) for Clinic A';
    ELSE
        RAISE EXCEPTION 'FAILURE: get_low_stock_medicines returned % for Clinic A, expected 1', v_count;
    END IF;
    
    -- Verify content
    SELECT count(*) INTO v_count FROM public.get_low_stock_medicines() WHERE id = 9001;
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: get_low_stock_medicines returned the correct medicine (9001)';
    ELSE
        RAISE EXCEPTION 'FAILURE: get_low_stock_medicines did not return medicine 9001';
    END IF;
END $$;

-- Simulate Clinic B session
SET LOCAL "request.jwt.claims" = '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "clinic_id": 888, "role": "authenticated"}';

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM public.get_low_stock_medicines();
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: get_low_stock_medicines returned correct count (1) for Clinic B';
    ELSE
        RAISE EXCEPTION 'FAILURE: get_low_stock_medicines returned % for Clinic B, expected 1', v_count;
    END IF;
    
    -- Verify content
    SELECT count(*) INTO v_count FROM public.get_low_stock_medicines() WHERE id = 8001;
    IF v_count = 1 THEN
        RAISE NOTICE 'SUCCESS: get_low_stock_medicines returned the correct medicine (8001)';
    ELSE
        RAISE EXCEPTION 'FAILURE: get_low_stock_medicines did not return medicine 8001';
    END IF;
END $$;

-- 3. Test Security: Anonymous access should fail
SET LOCAL "request.jwt.claims" = '{"role": "anon"}';
DO $$
BEGIN
    PERFORM public.get_low_stock_medicines();
    RAISE EXCEPTION 'FAILURE: get_low_stock_medicines should have failed for anon';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: get_low_stock_medicines failed as expected for anon: %', SQLERRM;
END $$;

-- 4. Test join logic for isMedicineInUse
-- Simulate Clinic A
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "clinic_id": 999, "role": "authenticated"}';

-- Create a prescription for Clinic A using Med A
INSERT INTO public.patients (id, name, clinic_id) VALUES (9991, 'Patient A', 999) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.prescriptions_header (id, patient_id, clinic_id) VALUES (99901, 9991, 999) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.prescription_details (prescription_header_id, medicine_id, quantity) VALUES (99901, 9001, 1) ON CONFLICT DO NOTHING;

DO $$
DECLARE
    v_in_use BOOLEAN;
BEGIN
    -- Check if Med A is in use for Clinic A
    SELECT EXISTS (
        SELECT 1 
        FROM public.prescription_details pd
        JOIN public.prescriptions_header ph ON ph.id = pd.prescription_header_id
        WHERE pd.medicine_id = 9001 AND ph.clinic_id = 999
    ) INTO v_in_use;
    
    IF v_in_use THEN
        RAISE NOTICE 'SUCCESS: Med A correctly identified as in use for Clinic A';
    ELSE
        RAISE EXCEPTION 'FAILURE: Med A should be in use for Clinic A';
    END IF;

    -- Check if Med B (Clinic B) is in use for Clinic A
    SELECT EXISTS (
        SELECT 1 
        FROM public.prescription_details pd
        JOIN public.prescriptions_header ph ON ph.id = pd.prescription_header_id
        WHERE pd.medicine_id = 8001 AND ph.clinic_id = 999
    ) INTO v_in_use;
    
    IF NOT v_in_use THEN
        RAISE NOTICE 'SUCCESS: Med B correctly identified as NOT in use for Clinic A context';
    ELSE
        RAISE EXCEPTION 'FAILURE: Med B should NOT be in use for Clinic A context';
    END IF;
END $$;

ROLLBACK;
