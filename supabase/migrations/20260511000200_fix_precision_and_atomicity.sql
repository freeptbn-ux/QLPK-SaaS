-- Migration: Fix precision and atomicity for medicines and prescriptions
-- Created At: 2026-05-11
-- Objective: Phase 02 - NUMERIC types and atomic inventory updates

BEGIN;

-- 1. Fix Precision
-- Convert REAL/FLOAT4 to NUMERIC(12,2) for currency fields
ALTER TABLE public.medicines 
  ALTER COLUMN price TYPE NUMERIC(12,2);

ALTER TABLE public.prescriptions_header 
  ALTER COLUMN total_amount TYPE NUMERIC(12,2);

ALTER TABLE public.prescriptions_header 
  ALTER COLUMN consultation_fee TYPE NUMERIC(12,2);

ALTER TABLE public.prescription_details 
  ALTER COLUMN unit_price TYPE NUMERIC(12,2);

-- 2. Ensure Safety Constraints
-- Ensure stock_quantity cannot be negative (final line of defense)
ALTER TABLE public.medicines DROP CONSTRAINT IF EXISTS medicines_stock_quantity_check;
ALTER TABLE public.medicines ADD CONSTRAINT medicines_stock_quantity_check CHECK (stock_quantity >= 0);

-- 3. Update update_prescription RPC
-- Objective: Atomic updates with proper locking and precision
CREATE OR REPLACE FUNCTION update_prescription(
  p_prescription_id BIGINT,
  p_diagnosis TEXT,
  p_notes TEXT,
  p_prescription_date TIMESTAMPTZ,
  p_items JSONB
) RETURNS VOID AS $$
DECLARE
  v_patient_id BIGINT;
  v_consultation_fee NUMERIC(12,2);
  v_old_item RECORD;
  v_item JSONB;
  v_total_medicines NUMERIC(12,2) := 0;
  v_history_text TEXT := '';
  v_index INTEGER := 1;
  v_latest_prescription_id BIGINT;
  v_medicine_id BIGINT;
  v_quantity INTEGER;
  v_current_stock INTEGER;
  v_medicine_name TEXT;
  v_clinic_id BIGINT;
BEGIN
  -- Get current clinic_id for security
  v_clinic_id := get_my_clinic_id();

  -- 1. Lock the prescription header and get basic info
  SELECT patient_id, consultation_fee 
  INTO v_patient_id, v_consultation_fee 
  FROM prescriptions_header 
  WHERE id = p_prescription_id AND clinic_id = v_clinic_id
  FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prescription not found or access denied';
  END IF;

  -- 2. BÙ KHO: Hoàn trả stock cho tất cả thuốc cũ
  -- We lock the medicines involved to prevent race conditions
  FOR v_old_item IN 
    SELECT medicine_id, quantity 
    FROM prescription_details 
    WHERE prescription_header_id = p_prescription_id
  LOOP
    UPDATE medicines
    SET stock_quantity = stock_quantity + v_old_item.quantity
    WHERE id = v_old_item.medicine_id AND clinic_id = v_clinic_id;
  END LOOP;

  -- 3. XÓA details cũ
  DELETE FROM prescription_details 
  WHERE prescription_header_id = p_prescription_id;

  -- 4. INSERT details mới + TRỪ KHO
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_medicine_id := (v_item->>'medicine_id')::BIGINT;
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    -- Lock medicine for update and check stock
    SELECT stock_quantity, name INTO v_current_stock, v_medicine_name
    FROM medicines
    WHERE id = v_medicine_id AND clinic_id = v_clinic_id
    FOR NO KEY UPDATE;

    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for medicine %: requested %, available %', 
        v_medicine_name, v_quantity, v_current_stock;
    END IF;

    INSERT INTO prescription_details (
      prescription_header_id, medicine_id, quantity, unit_price
    ) VALUES (
      p_prescription_id,
      v_medicine_id,
      v_quantity,
      (v_item->>'unit_price')::NUMERIC(12,2)
    );

    v_total_medicines := v_total_medicines 
      + (v_quantity * (v_item->>'unit_price')::NUMERIC(12,2));

    -- Build legacy history text
    v_history_text := v_history_text || v_index || ') ' 
      || (v_item->>'medicine_name') || ' x ' 
      || v_quantity || ' ' 
      || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Trừ kho cho thuốc mới
    UPDATE medicines
    SET stock_quantity = stock_quantity - v_quantity
    WHERE id = v_medicine_id AND clinic_id = v_clinic_id;
  END LOOP;

  -- 5. Update header
  UPDATE prescriptions_header 
  SET 
    diagnosis = p_diagnosis,
    notes = p_notes,
    prescription_date = p_prescription_date,
    total_amount = v_total_medicines + v_consultation_fee
  WHERE id = p_prescription_id AND clinic_id = v_clinic_id;

  -- 6. Cập nhật patient nếu đây là đơn mới nhất
  SELECT id INTO v_latest_prescription_id
  FROM prescriptions_header
  WHERE patient_id = v_patient_id AND clinic_id = v_clinic_id
  ORDER BY prescription_date DESC
  LIMIT 1;

  IF v_latest_prescription_id = p_prescription_id THEN
    UPDATE patients 
    SET 
      diagnosis = p_diagnosis,
      medical_history = p_diagnosis || E'\n' || v_history_text,
      updated_at = NOW()
    WHERE id = v_patient_id AND clinic_id = v_clinic_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
