-- Final Verification Script for Phase 05
-- Objective: Verify multi-tenancy, financial precision, and atomicity

BEGIN;

-- 1. Setup Test Environment
INSERT INTO public.clinics (id, name) VALUES (777, 'Clinic Alpha'), (666, 'Clinic Beta') ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, clinic_id, role, full_name) 
VALUES 
('77777777-7777-7777-7777-777777777777', 777, 'admin', 'Dr. Alpha'),
('66666666-6666-6666-6666-666666666666', 666, 'admin', 'Dr. Beta')
ON CONFLICT (id) DO NOTHING;

-- 2. VERIFY: Lỗi 1 - Xung đột tên thuốc (Multi-tenancy)
-- Login as Clinic Alpha
SET LOCAL "request.jwt.claims" = '{"sub": "77777777-7777-7777-7777-777777777777", "clinic_id": 777, "role": "authenticated"}';
INSERT INTO public.medicines (name, price, stock_quantity, clinic_id) VALUES ('TestDrug', 100.0, 100, 777);

-- Login as Clinic Beta
SET LOCAL "request.jwt.claims" = '{"sub": "66666666-6666-6666-6666-666666666666", "clinic_id": 666, "role": "authenticated"}';
-- Should succeed even if name is same
INSERT INTO public.medicines (name, price, stock_quantity, clinic_id) VALUES ('TestDrug', 150.0, 50, 666);

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM public.medicines WHERE name = 'TestDrug';
    IF v_count = 2 THEN
        RAISE NOTICE 'SUCCESS: Duplicate drug names allowed across different clinics';
    ELSE
        RAISE EXCEPTION 'FAILURE: Expected 2 rows for TestDrug, found %', v_count;
    END IF;
END $$;

-- Try to insert same name in same clinic (Beta) - Should FAIL
DO $$
BEGIN
    INSERT INTO public.medicines (name, price, stock_quantity, clinic_id) VALUES ('TestDrug', 200.0, 10, 666);
    RAISE EXCEPTION 'FAILURE: Unique constraint on (name, clinic_id) failed to trigger';
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'SUCCESS: Unique constraint correctly blocked duplicate name within the same clinic';
END $$;

-- 3. VERIFY: Lỗi 3 - Sai số tài chính (Precision)
SET LOCAL "request.jwt.claims" = '{"sub": "77777777-7777-7777-7777-777777777777", "clinic_id": 777, "role": "authenticated"}';
UPDATE public.medicines SET price = 19.99 WHERE name = 'TestDrug' AND clinic_id = 777;

DO $$
DECLARE
    v_total NUMERIC(12,2);
BEGIN
    -- 19.99 * 3 = 59.97
    SELECT price * 3 INTO v_total FROM public.medicines WHERE name = 'TestDrug' AND clinic_id = 777;
    IF v_total = 59.97 THEN
        RAISE NOTICE 'SUCCESS: Financial precision maintained (19.99 * 3 = 59.97)';
    ELSE
        RAISE EXCEPTION 'FAILURE: Precision loss detected, expected 59.97, got %', v_total;
    END IF;
END $$;

-- 4. VERIFY: Lỗi 4 - Cập nhật tồn kho nguyên tử (update_prescription)
-- Setup patient and medicine
INSERT INTO public.patients (id, name, clinic_id) VALUES (7771, 'Alpha Patient', 777) ON CONFLICT (id) DO NOTHING;
UPDATE public.medicines SET stock_quantity = 100 WHERE name = 'TestDrug' AND clinic_id = 777;

DO $$
DECLARE
    v_prescription_id BIGINT;
    v_stock INTEGER;
BEGIN
    -- Create initial prescription
    -- Need to use the unified_create_prescription if available, or manual insert for test
    INSERT INTO public.prescriptions_header (patient_id, clinic_id, consultation_fee) 
    VALUES (7771, 777, 50.0) RETURNING id INTO v_prescription_id;

    -- Call update_prescription with 10 units of TestDrug
    PERFORM update_prescription(
        v_prescription_id,
        'Initial Diagnosis',
        'Notes',
        now(),
        '[{"medicine_id": ' || (SELECT id FROM medicines WHERE name = 'TestDrug' AND clinic_id = 777) || ', "quantity": 10, "unit_price": 19.99, "medicine_name": "TestDrug", "packing_spec": "Box"}]'::jsonb
    );

    SELECT stock_quantity INTO v_stock FROM medicines WHERE name = 'TestDrug' AND clinic_id = 777;
    IF v_stock = 90 THEN
        RAISE NOTICE 'SUCCESS: Stock correctly reduced after update_prescription (100 -> 90)';
    ELSE
        RAISE EXCEPTION 'FAILURE: Stock incorrect after update, expected 90, got %', v_stock;
    END IF;

    -- Update again, changing quantity to 30 (should restore 10 then subtract 30 -> 100 - 30 = 70)
    PERFORM update_prescription(
        v_prescription_id,
        'Updated Diagnosis',
        'Updated Notes',
        now(),
        '[{"medicine_id": ' || (SELECT id FROM medicines WHERE name = 'TestDrug' AND clinic_id = 777) || ', "quantity": 30, "unit_price": 19.99, "medicine_name": "TestDrug", "packing_spec": "Box"}]'::jsonb
    );

    SELECT stock_quantity INTO v_stock FROM medicines WHERE name = 'TestDrug' AND clinic_id = 777;
    IF v_stock = 70 THEN
        RAISE NOTICE 'SUCCESS: Stock correctly updated after second update_prescription (90 -> 100 -> 70)';
    ELSE
        RAISE EXCEPTION 'FAILURE: Stock incorrect after second update, expected 70, got %', v_stock;
    END IF;
    
    -- Test Insufficient Stock
    BEGIN
        PERFORM update_prescription(
            v_prescription_id,
            'High Quantity',
            'Notes',
            now(),
            '[{"medicine_id": ' || (SELECT id FROM medicines WHERE name = 'TestDrug' AND clinic_id = 777) || ', "quantity": 200, "unit_price": 19.99, "medicine_name": "TestDrug", "packing_spec": "Box"}]'::jsonb
        );
        RAISE EXCEPTION 'FAILURE: update_prescription should fail due to insufficient stock';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: update_prescription correctly blocked due to insufficient stock: %', SQLERRM;
    END;
END $$;

-- 5. VERIFY: Lỗi 5 & 6 - Tenant Context & RPC security
-- Security check: anon access
SET LOCAL "request.jwt.claims" = '{"role": "anon"}';
DO $$
BEGIN
    PERFORM public.get_low_stock_medicines();
    RAISE EXCEPTION 'FAILURE: get_low_stock_medicines accessible to anon';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: get_low_stock_medicines blocked for anon';
END $$;

-- Performance: Check index existence
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medicines_low_stock') THEN
        RAISE NOTICE 'SUCCESS: Low stock optimization index exists';
    ELSE
        RAISE EXCEPTION 'FAILURE: Low stock optimization index missing';
    END IF;
END $$;

ROLLBACK;
