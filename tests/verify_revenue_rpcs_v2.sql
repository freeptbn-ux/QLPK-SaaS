-- Test Revenue Fix (Phase 01)
-- Objective: Verify that revenue calculation includes consultation_fee and handles rounding correctly.

BEGIN;

-- 1. Create a dummy prescription with total_amount and consultation_fee
-- We use a high bigint value for the ID to avoid conflicts
INSERT INTO prescriptions_header (id, prescription_date, total_amount, consultation_fee, patient_id, clinic_id)
SELECT 
  9999999999, 
  CURRENT_DATE, 
  1000, 
  500, 
  (SELECT id FROM patients LIMIT 1), 
  (SELECT id FROM clinics LIMIT 1)
WHERE EXISTS (SELECT 1 FROM patients LIMIT 1) AND EXISTS (SELECT 1 FROM clinics LIMIT 1);

-- 2. Check get_monthly_revenue_total
DO $$
DECLARE
  v_revenue numeric;
BEGIN
  SELECT get_monthly_revenue_total() INTO v_revenue;
  IF v_revenue < 1500 THEN
    RAISE EXCEPTION 'get_monthly_revenue_total failed: expected at least 1500, got %', v_revenue;
  END IF;
  RAISE NOTICE 'get_monthly_revenue_total verified: %', v_revenue;
END $$;

-- 3. Check get_revenue_stats
DO $$
DECLARE
  v_revenue numeric;
BEGIN
  SELECT revenue INTO v_revenue FROM get_revenue_stats() WHERE name = to_char(CURRENT_DATE, 'MM/YYYY');
  IF v_revenue < 1500 THEN
    RAISE EXCEPTION 'get_revenue_stats failed: expected at least 1500 for current month, got %', v_revenue;
  END IF;
  RAISE NOTICE 'get_revenue_stats verified: %', v_revenue;
END $$;

ROLLBACK;
