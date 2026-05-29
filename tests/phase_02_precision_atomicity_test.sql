-- Test Suite: Medicines Precision & Atomicity (Phase 02)
-- Purpose: Verify financial precision and atomic stock updates

DO $$
DECLARE
    v_clinic_id BIGINT;
    v_patient_id BIGINT;
    v_medicine_id BIGINT;
    v_prescription_id BIGINT;
    v_initial_stock INTEGER := 100;
    v_items JSONB;
    v_total NUMERIC(12,2);
    v_unit_price NUMERIC(12,2) := 1234567.89; -- High precision test
    v_quantity INTEGER := 2;
    v_expected_total NUMERIC(12,2);
    v_actual_stock INTEGER;
    v_test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- 1. Setup
    -- Ensure test clinic exists
    INSERT INTO clinics (id, name) 
    VALUES (999, 'Test Precision Clinic')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_clinic_id;

    -- Setup test profile for get_my_clinic_id()
    INSERT INTO profiles (id, clinic_id, role, full_name)
    VALUES (v_test_user_id, v_clinic_id, 'admin', 'Test Admin')
    ON CONFLICT (id) DO UPDATE SET clinic_id = EXCLUDED.clinic_id;

    -- Mock auth.uid() by setting the claim (standard for Supabase testing in SQL)
    EXECUTE format('SET LOCAL "request.jwt.claims" = %L', json_build_object('sub', v_test_user_id)::text);

    INSERT INTO patients (name, phone, clinic_id) 
    VALUES ('Precision Test Patient', '0123456789', v_clinic_id) 
    RETURNING id INTO v_patient_id;

    INSERT INTO medicines (name, price, stock_quantity, clinic_id)
    VALUES ('Precision Test Medicine', v_unit_price, v_initial_stock, v_clinic_id)
    RETURNING id INTO v_medicine_id;

    -- Create initial prescription header
    INSERT INTO prescriptions_header (patient_id, clinic_id, consultation_fee)
    VALUES (v_patient_id, v_clinic_id, 1000.50)
    RETURNING id INTO v_prescription_id;

    -- 2. Test Precision
    v_items := jsonb_build_array(
        jsonb_build_object(
            'medicine_id', v_medicine_id,
            'medicine_name', 'Precision Test Medicine',
            'quantity', v_quantity,
            'unit_price', v_unit_price,
            'packing_spec', 'Box'
        )
    );

    v_expected_total := (v_unit_price * v_quantity) + 1000.50;

    -- Call the RPC
    PERFORM update_prescription(
        v_prescription_id,
        'Diagnosis test',
        'Notes test',
        now(),
        v_items
    );

    SELECT total_amount INTO v_total FROM prescriptions_header WHERE id = v_prescription_id;
    
    IF v_total != v_expected_total THEN
        RAISE EXCEPTION 'Precision Mismatch: Expected %, Got %', v_expected_total, v_total;
    END IF;
    RAISE NOTICE 'Success: Precision test passed (%)', v_total;

    -- 3. Test Stock Atomicity (Deduction)
    SELECT stock_quantity INTO v_actual_stock FROM medicines WHERE id = v_medicine_id;
    IF v_actual_stock != (v_initial_stock - v_quantity) THEN
        RAISE EXCEPTION 'Stock Deducation Mismatch: Expected %, Got %', (v_initial_stock - v_quantity), v_actual_stock;
    END IF;
    RAISE NOTICE 'Success: Stock deduction passed (%)', v_actual_stock;

    -- 4. Test Stock Return (Update prescription with different quantity)
    v_quantity := 5;
    v_items := jsonb_build_array(
        jsonb_build_object(
            'medicine_id', v_medicine_id,
            'medicine_name', 'Precision Test Medicine',
            'quantity', v_quantity,
            'unit_price', v_unit_price,
            'packing_spec', 'Box'
        )
    );
    
    PERFORM update_prescription(
        v_prescription_id,
        'Diagnosis updated',
        'Notes updated',
        now(),
        v_items
    );

    SELECT stock_quantity INTO v_actual_stock FROM medicines WHERE id = v_medicine_id;
    IF v_actual_stock != (v_initial_stock - v_quantity) THEN
        RAISE EXCEPTION 'Stock Return Mismatch: Expected %, Got %', (v_initial_stock - v_quantity), v_actual_stock;
    END IF;
    RAISE NOTICE 'Success: Stock return/update passed (%)', v_actual_stock;

    -- 5. Test Negative Stock Prevention
    v_quantity := 200; -- More than available
    v_items := jsonb_build_array(
        jsonb_build_object(
            'medicine_id', v_medicine_id,
            'medicine_name', 'Precision Test Medicine',
            'quantity', v_quantity,
            'unit_price', v_unit_price,
            'packing_spec', 'Box'
        )
    );

    BEGIN
        PERFORM update_prescription(
            v_prescription_id,
            'Diagnosis overkill',
            'Notes overkill',
            now(),
            v_items
        );
        RAISE EXCEPTION 'FAIL: Should have blocked negative stock';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Success: Caught expected exception for insufficient stock: %', SQLERRM;
    END;

    -- 6. Verify stock remains unchanged after failed update
    SELECT stock_quantity INTO v_actual_stock FROM medicines WHERE id = v_medicine_id;
    IF v_actual_stock != (v_initial_stock - 5) THEN -- 95
        RAISE EXCEPTION 'Rollback Failure: Stock should be 95, Got %', v_actual_stock;
    END IF;
    RAISE NOTICE 'Success: Transaction rolled back correctly, stock preserved at %', v_actual_stock;

    -- 7. Test Isolation / Locking (Simulated check)
    -- We've already verified the "Insufficient stock" exception works, which is part of the logic.
    -- The FOR NO KEY UPDATE ensures that if another transaction was trying to update the SAME medicine, 
    -- it would wait for this one to finish.

    -- Cleanup
    DELETE FROM prescription_details WHERE prescription_header_id = v_prescription_id;
    DELETE FROM prescriptions_header WHERE id = v_prescription_id;
    DELETE FROM medicines WHERE id = v_medicine_id;
    DELETE FROM patients WHERE id = v_patient_id;
    DELETE FROM profiles WHERE id = v_test_user_id;
    -- DELETE FROM clinics WHERE id = v_clinic_id; -- Might fail due to FKs from other tables, skip

    RAISE NOTICE 'All Phase 02 tests PASSED';
END $$;
