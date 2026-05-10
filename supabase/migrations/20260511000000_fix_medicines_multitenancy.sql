-- Phase 01: Fix Medicines Multitenancy & Security Hardening
-- Created: 2026-05-11

BEGIN;

-- 1. Fix Medicines Unique Constraint
DO $$
DECLARE
    v_constraint_name TEXT;
BEGIN
    SELECT conname INTO v_constraint_name
    FROM pg_constraint
    WHERE conrelid = 'medicines'::regclass AND contype = 'u';
    
    IF v_constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE medicines DROP CONSTRAINT ' || v_constraint_name;
    END IF;
END $$;

DROP INDEX IF EXISTS medicines_name_key;

-- Add new tenant-aware unique constraint
ALTER TABLE medicines ADD CONSTRAINT medicines_name_clinic_id_key UNIQUE (name, clinic_id);

-- 2. Harden clinic_id column
UPDATE medicines SET clinic_id = 1 WHERE clinic_id IS NULL;
ALTER TABLE medicines ALTER COLUMN clinic_id DROP DEFAULT;
ALTER TABLE medicines ALTER COLUMN clinic_id SET NOT NULL;

-- 3. Update Trigger Logic to prevent fallback to Clinic 1
CREATE OR REPLACE FUNCTION public.set_clinic_id_from_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_clinic_id BIGINT;
BEGIN
    v_clinic_id := get_my_clinic_id();
    
    IF v_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User profile or clinic not found. Cannot determine clinic_id.';
    END IF;

    NEW.clinic_id := v_clinic_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Security Hardening: Revoke from 'anon' and 'PUBLIC'
-- Revoke all access to medicines table
REVOKE ALL ON TABLE medicines FROM anon, PUBLIC;

-- Revoke all access to prescription-related tables from anon (extra safety)
REVOKE ALL ON TABLE prescriptions_header FROM anon, PUBLIC;
REVOKE ALL ON TABLE prescription_details FROM anon, PUBLIC;

-- Revoke execute on known medicine-related functions from PUBLIC
DO $$ DECLARE
    r record;
BEGIN
    FOR r IN (SELECT oid, proname FROM pg_proc WHERE proname IN ('adjust_medicine_stock', 'create_prescription', 'update_prescription', 'delete_prescription'))
    LOOP
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.oid::regprocedure || ' FROM PUBLIC, anon';
    END LOOP;
END $$;

-- Re-grant to authenticated explicitly
GRANT ALL ON TABLE medicines TO authenticated;
GRANT ALL ON TABLE prescriptions_header TO authenticated;
GRANT ALL ON TABLE prescription_details TO authenticated;

DO $$ DECLARE
    r record;
BEGIN
    FOR r IN (SELECT oid, proname FROM pg_proc WHERE proname IN ('adjust_medicine_stock', 'create_prescription', 'update_prescription', 'delete_prescription'))
    LOOP
        EXECUTE 'GRANT EXECUTE ON FUNCTION ' || r.oid::regprocedure || ' TO authenticated';
    END LOOP;
END $$;

COMMIT;
