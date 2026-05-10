-- Migration: Add update_prescription RPC
-- Created At: 2026-04-26T16:30:00Z
-- Objective: Handle prescription editing in a single transaction with inventory sync

CREATE OR REPLACE FUNCTION update_prescription(
  p_prescription_id BIGINT,
  p_diagnosis TEXT,
  p_notes TEXT,
  p_prescription_date TIMESTAMPTZ,
  p_items JSONB
) RETURNS VOID AS $$
DECLARE
  v_patient_id BIGINT;
  v_consultation_fee REAL;
  v_old_item RECORD;
  v_item JSONB;
  v_total_medicines REAL := 0;
  v_history_text TEXT := '';
  v_index INTEGER := 1;
  v_latest_prescription_id BIGINT;
BEGIN
  -- 1. Lấy patient_id và consultation_fee từ header hiện tại
  SELECT patient_id, consultation_fee 
  INTO v_patient_id, v_consultation_fee 
  FROM prescriptions_header 
  WHERE id = p_prescription_id;

  -- 2. BÙ KHO: Hoàn trả stock cho tất cả thuốc cũ
  FOR v_old_item IN 
    SELECT medicine_id, quantity 
    FROM prescription_details 
    WHERE prescription_header_id = p_prescription_id
  LOOP
    UPDATE medicines
    SET stock_quantity = stock_quantity + v_old_item.quantity
    WHERE id = v_old_item.medicine_id;
  END LOOP;

  -- 3. XÓA details cũ
  DELETE FROM prescription_details 
  WHERE prescription_header_id = p_prescription_id;

  -- 4. INSERT details mới + TRỪ KHO
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO prescription_details (
      prescription_header_id, medicine_id, quantity, unit_price
    ) VALUES (
      p_prescription_id,
      (v_item->>'medicine_id')::BIGINT,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::REAL
    );

    v_total_medicines := v_total_medicines 
      + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;

    -- Build legacy history text
    v_history_text := v_history_text || v_index || ') ' 
      || (v_item->>'medicine_name') || ' x ' 
      || (v_item->>'quantity') || ' ' 
      || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Trừ kho cho thuốc mới
    UPDATE medicines
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'medicine_id')::BIGINT;
  END LOOP;

  -- 5. Update header
  UPDATE prescriptions_header 
  SET 
    diagnosis = p_diagnosis,
    notes = p_notes,
    prescription_date = p_prescription_date,
    total_amount = v_total_medicines + v_consultation_fee
  WHERE id = p_prescription_id;

  -- 6. Cập nhật patient nếu đây là đơn mới nhất
  SELECT id INTO v_latest_prescription_id
  FROM prescriptions_header
  WHERE patient_id = v_patient_id
  ORDER BY prescription_date DESC
  LIMIT 1;

  IF v_latest_prescription_id = p_prescription_id THEN
    UPDATE patients 
    SET 
      diagnosis = p_diagnosis,
      medical_history = p_diagnosis || E'\n' || v_history_text,
      updated_at = NOW()
    WHERE id = v_patient_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_prescription(BIGINT, TEXT, TEXT, TIMESTAMPTZ, JSONB) 
TO authenticated;
GRANT EXECUTE ON FUNCTION update_prescription(BIGINT, TEXT, TEXT, TIMESTAMPTZ, JSONB) 
TO anon;
GRANT EXECUTE ON FUNCTION update_prescription(BIGINT, TEXT, TEXT, TIMESTAMPTZ, JSONB) 
TO service_role;
