-- Verification script for Phase 01: Security & Privacy Locking
-- This script checks if sensitive RPCs are restricted and if clinic isolation is working.

BEGIN;

-- 1. Helper to check function permissions
CREATE OR REPLACE FUNCTION check_function_executable(fn_name text, role_name text) 
RETURNS boolean AS $$
DECLARE
    is_exec boolean;
BEGIN
    -- Check if role has EXECUTE permission
    -- We use has_function_privilege which checks ACLs including PUBLIC
    SELECT has_function_privilege(role_name, oid, 'EXECUTE') INTO is_exec
    FROM pg_proc 
    WHERE proname = fn_name;
    
    RETURN is_exec;
END;
$$ LANGUAGE plpgsql;

-- 2. Check restricted functions (should return FALSE for anon)
SELECT 
    proname as function_name,
    check_function_executable(proname, 'anon') as is_anon_executable
FROM pg_proc
WHERE proname IN (
    'get_revenue_stats',
    'get_stats_by_day_for_month',
    'get_stats_by_location',
    'create_prescription',
    'update_prescription',
    'delete_prescription'
);

-- 3. Test Multi-tenancy Isolation
INSERT INTO clinics (id, name) VALUES (999, 'Clinic A'), (1000, 'Clinic B') ON CONFLICT DO NOTHING;
INSERT INTO patients (name, name_normalized, dob, phone, clinic_id, gender) VALUES 
('Isolation Test A', 'isolation test a', '2000-01-01', 'A', 999, 'Nam'),
('Isolation Test B', 'isolation test b', '2000-01-01', 'B', 1000, 'Nữ');
INSERT INTO prescriptions_header (patient_id, clinic_id, total_amount) 
SELECT id, clinic_id, 500 FROM patients WHERE name LIKE 'Isolation Test %';

-- Mock get_my_clinic_id
CREATE OR REPLACE FUNCTION get_my_clinic_id() RETURNS BIGINT AS $$ 
    BEGIN RETURN current_setting('test.clinic_id')::BIGINT; EXCEPTION WHEN OTHERS THEN RETURN NULL; END;
$$ LANGUAGE plpgsql;

-- Verify Clinic A only sees its own revenue
SET test.clinic_id = '999';
SELECT 'Clinic A Revenue' as check, revenue FROM get_revenue_stats(NULL);

-- Verify Clinic B only sees its own revenue
SET test.clinic_id = '1000';
SELECT 'Clinic B Revenue' as check, revenue FROM get_revenue_stats(NULL);

-- Cleanup (Rollback everything)
ROLLBACK;
