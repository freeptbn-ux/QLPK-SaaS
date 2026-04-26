-- RPC to safely delete a prescription and restore medicine stock
CREATE OR REPLACE FUNCTION delete_prescription(p_prescription_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v_patient_id BIGINT;
  v_item RECORD;
BEGIN
  -- Get patient_id before deleting
  SELECT patient_id INTO v_patient_id FROM prescriptions_header WHERE id = p_prescription_id;

  -- Restore stock for each medicine in the prescription
  FOR v_item IN 
    SELECT medicine_id, quantity 
    FROM prescription_details 
    WHERE prescription_header_id = p_prescription_id 
  LOOP
    UPDATE medicines
    SET stock_quantity = stock_quantity + v_item.quantity
    WHERE id = v_item.medicine_id;
  END LOOP;

  -- Delete header (this will cascade delete prescription_details due to ON DELETE CASCADE)
  DELETE FROM prescriptions_header 
  WHERE id = p_prescription_id;

  -- Sync patient's latest diagnosis
  UPDATE patients 
  SET 
    diagnosis = (
      SELECT diagnosis 
      FROM prescriptions_header 
      WHERE patient_id = v_patient_id 
      ORDER BY prescription_date DESC 
      LIMIT 1
    ),
    updated_at = NOW()
  WHERE id = v_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION delete_prescription(BIGINT) TO authenticated;
