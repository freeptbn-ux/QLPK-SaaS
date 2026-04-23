ALTER TABLE prescriptions_header ADD COLUMN IF NOT EXISTS consultation_fee REAL DEFAULT 0;

CREATE OR REPLACE FUNCTION create_prescription(
  p_patient_id BIGINT,
  p_diagnosis TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT '',
  p_consultation_fee REAL DEFAULT 0
) RETURNS BIGINT AS $$
DECLARE
  v_header_id BIGINT;
  v_total_medicines REAL := 0;
  v_item JSONB;
  v_history_text TEXT := '';
  v_index INTEGER := 1;
BEGIN
  -- Insert header
  INSERT INTO prescriptions_header (patient_id, diagnosis, notes, consultation_fee)
  VALUES (p_patient_id, p_diagnosis, p_notes, p_consultation_fee)
  RETURNING id INTO v_header_id;

  v_history_text := p_diagnosis || E'\n';

  -- Insert details + deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO prescription_details (prescription_header_id, medicine_id, quantity, unit_price)
    VALUES (
      v_header_id,
      (v_item->>'medicine_id')::BIGINT,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::REAL
    );

    v_total_medicines := v_total_medicines + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;

    -- Build legacy history text: 1) Thuốc A x 10 Viên
    v_history_text := v_history_text || v_index || ') ' || (v_item->>'medicine_name') || ' x ' || (v_item->>'quantity') || ' ' || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Deduct stock
    UPDATE medicines
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'medicine_id')::BIGINT;
  END LOOP;

  -- Update header total
  UPDATE prescriptions_header 
  SET total_amount = v_total_medicines + p_consultation_fee 
  WHERE id = v_header_id;

  -- Update patient diagnosis and legacy history
  UPDATE patients 
  SET 
    diagnosis = p_diagnosis,
    medical_history = v_history_text,
    updated_at = NOW()
  WHERE id = p_patient_id;

  RETURN v_header_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for appending to existing prescription
CREATE OR REPLACE FUNCTION append_to_prescription(
  p_header_id BIGINT,
  p_items JSONB
) RETURNS VOID AS $$
DECLARE
  v_item JSONB;
  v_total_add REAL := 0;
  v_patient_id BIGINT;
  v_history_text TEXT;
  v_index INTEGER;
BEGIN
  -- Get patient_id and existing history
  SELECT patient_id INTO v_patient_id FROM prescriptions_header WHERE id = p_header_id;
  SELECT medical_history INTO v_history_text FROM patients WHERE id = v_patient_id;
  
  -- Count existing items to continue indexing
  SELECT COUNT(*) + 1 INTO v_index FROM prescription_details WHERE prescription_header_id = p_header_id;

  -- Insert details + deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO prescription_details (prescription_header_id, medicine_id, quantity, unit_price)
    VALUES (
      p_header_id,
      (v_item->>'medicine_id')::BIGINT,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::REAL
    );

    v_total_add := v_total_add + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;

    -- Append to legacy history text
    v_history_text := v_history_text || v_index || ') ' || (v_item->>'medicine_name') || ' x ' || (v_item->>'quantity') || ' ' || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Deduct stock
    UPDATE medicines
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'medicine_id')::BIGINT;
  END LOOP;

  -- Update header total
  UPDATE prescriptions_header 
  SET total_amount = total_amount + v_total_add 
  WHERE id = p_header_id;

  -- Update legacy history
  UPDATE patients 
  SET 
    medical_history = v_history_text,
    updated_at = NOW()
  WHERE id = v_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
