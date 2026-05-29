-- Test Suite: Medicines Multitenancy & Security Hardening
-- Purpose: Verify that the changes in Phase 01 are working as expected.

DO $$
DECLARE
    v_clinic_a_id BIGINT;
    v_clinic_b_id BIGINT;
    v_medicine_name TEXT := 'Paracetamol ' || now()::text;
    v_error_message TEXT;
    v_anon_has_execute BOOLEAN;
BEGIN
    -- 1. Setup: Ensure we have two clinics
    SELECT id INTO v_clinic_a_id FROM clinics WHERE id = 1;
    INSERT INTO clinics (name) VALUES ('Test Clinic B') RETURNING id INTO v_clinic_b_id;
    
    RAISE NOTICE 'Testing with Clinic A (id: %) and Clinic B (id: %)', v_clinic_a_id, v_clinic_b_id;

    -- 2. Test UNIQUE (name, clinic_id)
    -- Clinic A: Insert medicine
    INSERT INTO medicines (name, clinic_id, stock_quantity) VALUES (v_medicine_name, v_clinic_a_id, 100);
    RAISE NOTICE 'Success: Inserted medicine in Clinic A';

    -- Clinic B: Insert medicine with SAME name (should succeed now)
    INSERT INTO medicines (name, clinic_id, stock_quantity) VALUES (v_medicine_name, v_clinic_b_id, 50);
    RAISE NOTICE 'Success: Inserted medicine with same name in Clinic B';

    -- Clinic A: Insert medicine with SAME name again (should FAIL)
    BEGIN
        INSERT INTO medicines (name, clinic_id, stock_quantity) VALUES (v_medicine_name, v_clinic_a_id, 100);
        RAISE EXCEPTION 'FAIL: Unique constraint (name, clinic_id) not working for Clinic A';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Success: Caught expected unique violation for Clinic A';
    END;

    -- 3. Test NOT NULL and NO DEFAULT for clinic_id
    BEGIN
        -- This bypasses the trigger if we use direct SQL without a session user, 
        -- but if clinic_id has a default it would fill it.
        -- We want to ensure it fails if not provided.
        INSERT INTO medicines (name, stock_quantity) VALUES ('Default Test', 10);
        RAISE EXCEPTION 'FAIL: clinic_id should not have a default and should be NOT NULL';
    EXCEPTION WHEN not_null_violation THEN
        RAISE NOTICE 'Success: Caught expected NOT NULL violation for clinic_id';
    END;

    -- 4. Test RPC permissions
    IF has_function_privilege('anon', 'medicine_usage_stats(text)', 'execute') THEN
        RAISE EXCEPTION 'FAIL: anon has execute on medicine_usage_stats(text)';
    END IF;

    IF has_function_privilege('anon', 'get_medicine_usage_stats(text)', 'execute') THEN
        RAISE EXCEPTION 'FAIL: anon has execute on get_medicine_usage_stats(text)';
    END IF;

    -- Re-enable trigger
    ALTER TABLE medicines ENABLE TRIGGER tr_set_clinic_id_medicines;

    -- Cleanup (ignore errors if cleanup fails due to FK)
    BEGIN
        DELETE FROM medicines WHERE name = v_medicine_name;
        DELETE FROM clinics WHERE id = v_clinic_b_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup note: %', SQLERRM;
    END;
    
    RAISE NOTICE 'All Phase 01 tests PASSED';
END $$;
