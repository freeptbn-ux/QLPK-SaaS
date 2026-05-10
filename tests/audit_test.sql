-- Test script for Audit Trail & Compliance

-- 1. Setup test data
-- Insert a test medicine
INSERT INTO public.medicines (name, packing_spec, price, stock_quantity, min_stock_level, clinic_id)
VALUES ('Audit Test Medicine', 'Box', 10000, 50, 10, 1)
ON CONFLICT (name) DO UPDATE SET stock_quantity = 50;

-- 2. Test UPDATE on medicines
UPDATE public.medicines 
SET stock_quantity = 45 
WHERE name = 'Audit Test Medicine';

-- 3. Check if log exists for UPDATE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.audit_logs 
        WHERE table_name = 'medicines' 
        AND operation = 'UPDATE' 
        AND (new_values->>'stock_quantity')::int = 45
    ) THEN
        RAISE EXCEPTION 'Audit log for medicine UPDATE not found!';
    END IF;
END $$;

-- 4. Test DELETE on prescriptions_header (need to create one first)
-- First, ensure a patient exists
INSERT INTO public.patients (name, dob, gender, phone, clinic_id)
VALUES ('Audit Test Patient', '1990-01-01', 'Male', '0987654321', 1)
ON CONFLICT DO NOTHING;

-- Insert prescription
INSERT INTO public.prescriptions_header (patient_id, diagnosis, total_amount, clinic_id)
SELECT id, 'Test Diagnosis', 50000, 1
FROM public.patients WHERE name = 'Audit Test Patient'
LIMIT 1;

-- Delete prescription
DELETE FROM public.prescriptions_header 
WHERE diagnosis = 'Test Diagnosis' AND clinic_id = 1;

-- 5. Check if log exists for DELETE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.audit_logs 
        WHERE table_name = 'prescriptions_header' 
        AND operation = 'DELETE' 
        AND old_values->>'diagnosis' = 'Test Diagnosis'
    ) THEN
        RAISE EXCEPTION 'Audit log for prescription DELETE not found!';
    END IF;
END $$;

-- 6. Test Immutability: Try to update a log entry
DO $$
BEGIN
    BEGIN
        UPDATE public.audit_logs SET operation = 'HACKED' WHERE id = (SELECT max(id) FROM public.audit_logs);
        RAISE EXCEPTION 'Log update should have been blocked!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM ~ 'Updates or deletes on audit_logs are not allowed' THEN
            -- Success: Exception caught as expected
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
    END;
END $$;

-- 7. Test Immutability: Try to delete a log entry
DO $$
BEGIN
    BEGIN
        DELETE FROM public.audit_logs WHERE id = (SELECT max(id) FROM public.audit_logs);
        RAISE EXCEPTION 'Log delete should have been blocked!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM ~ 'Updates or deletes on audit_logs are not allowed' THEN
            -- Success: Exception caught as expected
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
    END;
END $$;

-- Cleanup test data (except logs which are immutable)
DELETE FROM public.medicines WHERE name = 'Audit Test Medicine';
DELETE FROM public.patients WHERE name = 'Audit Test Patient';

SELECT 'AUDIT TRAIL TESTS PASSED SUCCESSFULLY' as result;
