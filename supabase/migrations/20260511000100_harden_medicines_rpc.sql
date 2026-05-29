-- Phase 01: Security Hardening for Medicines RPCs
-- This migration ensures that ALL medicine-related RPCs are revoked from 'anon' and 'PUBLIC' roles.
-- It also verifies that the 'clinic_id' fallback is completely removed.

BEGIN;

-- 1. Identify and Revoke Execute from 'anon' and 'PUBLIC' for all medicine-related RPCs
DO $$ 
DECLARE
    r record;
BEGIN
    FOR r IN (
        SELECT oid, proname 
        FROM pg_proc 
        WHERE pronamespace = 'public'::regnamespace 
        AND (
            proname IN (
                'medicine_usage_stats', 
                'get_low_stock_count', 
                'append_to_prescription', 
                'adjust_medicine_stock', 
                'get_medicine_usage_stats', 
                'create_prescription', 
                'update_prescription', 
                'delete_prescription'
            )
            OR proname ILIKE '%medicine%'
        )
    )
    LOOP
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || r.oid::regprocedure || ' FROM PUBLIC, anon';
        EXECUTE 'GRANT EXECUTE ON FUNCTION ' || r.oid::regprocedure || ' TO authenticated';
    END LOOP;
END $$;

-- 2. Double check clinic_id column on medicines
ALTER TABLE medicines ALTER COLUMN clinic_id DROP DEFAULT;
ALTER TABLE medicines ALTER COLUMN clinic_id SET NOT NULL;

-- 3. Ensure the trigger is robust (already checked, but re-applying to be safe)
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

COMMIT;
