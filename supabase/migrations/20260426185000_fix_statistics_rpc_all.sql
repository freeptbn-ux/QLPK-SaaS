-- Update RPC to support 'all' filter type
CREATE OR REPLACE FUNCTION get_patient_dobs_by_time(p_filter_type text, p_time_value text DEFAULT NULL)
RETURNS TABLE(dob text) AS $$
BEGIN
  IF p_filter_type = 'month' THEN
    RETURN QUERY
    SELECT p.dob
    FROM prescriptions_header ph
    JOIN patients p ON p.id = ph.patient_id
    WHERE to_char(ph.prescription_date, 'YYYY-MM') = p_time_value
    AND p.dob IS NOT NULL;
  ELSIF p_filter_type = 'year' THEN
    RETURN QUERY
    SELECT p.dob
    FROM prescriptions_header ph
    JOIN patients p ON p.id = ph.patient_id
    WHERE to_char(ph.prescription_date, 'YYYY') = p_time_value
    AND p.dob IS NOT NULL;
  ELSIF p_filter_type = 'all' THEN
    RETURN QUERY
    SELECT dob
    FROM patients
    WHERE dob IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
