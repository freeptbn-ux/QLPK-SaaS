BEGIN;

-- 1. Setup mock data
-- Ensure we have a clinic and medicine to test with
INSERT INTO clinics (id, name) VALUES (999, 'Test Clinic') ON CONFLICT (id) DO NOTHING;
INSERT INTO medicines (id, name, stock_quantity, clinic_id) 
VALUES (999, 'Test Medicine 999', 10, 999) 
ON CONFLICT (id) DO NOTHING;

-- 2. Test positive adjustment
SELECT adjust_medicine_stock(999, 5, 'Restock Test');
DO $$
BEGIN
    IF (SELECT stock_quantity FROM medicines WHERE id = 999) != 15 THEN
        RAISE EXCEPTION 'Positive adjustment failed: expected 15, got %', (SELECT stock_quantity FROM medicines WHERE id = 999);
    END IF;
    IF (SELECT count(*) FROM inventory_transaction_logs WHERE medicine_id = 999 AND adjustment = 5) = 0 THEN
        RAISE EXCEPTION 'Log for positive adjustment missing';
    END IF;
END $$;

-- 3. Test negative adjustment (valid)
SELECT adjust_medicine_stock(999, -10, 'Sale Test');
DO $$
BEGIN
    IF (SELECT stock_quantity FROM medicines WHERE id = 999) != 5 THEN
        RAISE EXCEPTION 'Negative adjustment failed: expected 5, got %', (SELECT stock_quantity FROM medicines WHERE id = 999);
    END IF;
END $$;

-- 4. Test negative adjustment (invalid - insufficient stock)
DO $$
BEGIN
    BEGIN
        SELECT adjust_medicine_stock(999, -10, 'Oversell Test');
        RAISE EXCEPTION 'Should have failed due to insufficient stock';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Caught expected exception (Insufficient stock): %', SQLERRM;
    END;
END $$;

-- 5. Test DB Constraint directly
DO $$
BEGIN
    BEGIN
        UPDATE medicines SET stock_quantity = -1 WHERE id = 999;
        RAISE EXCEPTION 'Should have failed due to CHECK constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Caught expected exception (CHECK constraint): %', SQLERRM;
    END;
END $$;

ROLLBACK;
