-- Phase 02: Data Integrity & History Preservation
-- Created: 2026-05-10
-- Objective: Ensure atomic transactions and immutable medical history

-- 1. Create patient_history_logs table
CREATE TABLE IF NOT EXISTS patient_history_logs (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE DEFAULT 1,
    prescription_id BIGINT REFERENCES prescriptions_header(id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    medical_history_snapshot TEXT, -- Snapshot of medications/notes at that time
    weight TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE patient_history_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can see history in their clinic" ON patient_history_logs;
CREATE POLICY "Users can see history in their clinic" 
    ON patient_history_logs FOR SELECT 
    TO authenticated 
    USING (clinic_id = get_my_clinic_id());

DROP POLICY IF EXISTS "Users can insert history in their clinic" ON patient_history_logs;
CREATE POLICY "Users can insert history in their clinic" 
    ON patient_history_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (clinic_id = get_my_clinic_id());

-- 4. Update create_prescription RPC to be atomic and include history/weight
CREATE OR REPLACE FUNCTION create_prescription(
  p_patient_id BIGINT,
  p_diagnosis TEXT,
  p_items JSONB,
  p_notes TEXT DEFAULT '',
  p_consultation_fee REAL DEFAULT 0,
  p_weight TEXT DEFAULT NULL -- Added weight parameter
) RETURNS BIGINT AS $$
DECLARE
  v_header_id BIGINT;
  v_total_medicines REAL := 0;
  v_item JSONB;
  v_history_snapshot TEXT := '';
  v_index INTEGER := 1;
  v_clinic_id BIGINT;
BEGIN
  v_clinic_id := get_my_clinic_id();

  -- Security check: patient must belong to same clinic
  IF NOT EXISTS (SELECT 1 FROM patients WHERE id = p_patient_id AND clinic_id = v_clinic_id) THEN
    RAISE EXCEPTION 'Patient not found or access denied';
  END IF;

  -- Insert header
  INSERT INTO prescriptions_header (patient_id, diagnosis, notes, consultation_fee, clinic_id)
  VALUES (p_patient_id, p_diagnosis, p_notes, p_consultation_fee, v_clinic_id)
  RETURNING id INTO v_header_id;

  -- Build history snapshot from items
  v_history_snapshot := p_notes || E'\n---\n';

  -- Insert details + deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Security check: medicine must belong to same clinic
    IF NOT EXISTS (SELECT 1 FROM medicines WHERE id = (v_item->>'medicine_id')::BIGINT AND clinic_id = v_clinic_id) THEN
      RAISE EXCEPTION 'Medicine not found or access denied: %', (v_item->>'medicine_id');
    END IF;

    INSERT INTO prescription_details (prescription_header_id, medicine_id, quantity, unit_price)
    VALUES (
      v_header_id,
      (v_item->>'medicine_id')::BIGINT,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::REAL
    );

    v_total_medicines := v_total_medicines + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;
    v_history_snapshot := v_history_snapshot || v_index || ') ' || (v_item->>'medicine_name') || ' x ' || (v_item->>'quantity') || ' ' || (v_item->>'packing_spec') || E'\n';
    v_index := v_index + 1;

    -- Deduct stock (atomic)
    UPDATE medicines
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'medicine_id')::BIGINT AND clinic_id = v_clinic_id;
  END LOOP;

  -- Update header total
  UPDATE prescriptions_header 
  SET total_amount = v_total_medicines + p_consultation_fee 
  WHERE id = v_header_id AND clinic_id = v_clinic_id;

  -- Update patient (Atomic: Weight + Latest Diagnosis)
  UPDATE patients 
  SET 
    diagnosis = p_diagnosis, 
    weight = COALESCE(p_weight, weight), -- Update if provided
    updated_at = NOW()
  WHERE id = p_patient_id AND clinic_id = v_clinic_id;

  -- Insert into history logs (New Requirement)
  INSERT INTO patient_history_logs (patient_id, clinic_id, prescription_id, diagnosis, medical_history_snapshot, weight)
  VALUES (p_patient_id, v_clinic_id, v_header_id, p_diagnosis, v_history_snapshot, p_weight);

  RETURN v_header_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
