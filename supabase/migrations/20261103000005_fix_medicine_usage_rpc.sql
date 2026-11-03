-- Migration: Fix and harden get_medicine_usage_by_patient RPC
-- Resolves clinic_id with fallback to patient record and orders results reliably

CREATE OR REPLACE FUNCTION public.get_medicine_usage_by_patient(p_patient_id BIGINT)
RETURNS TABLE (
  medicine_id BIGINT,
  medicine_name TEXT,
  packing_spec TEXT,
  times_prescribed BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $$
DECLARE
  v_clinic_id BIGINT;
BEGIN
  -- Resolve caller's clinic_id: prioritize auth context, fallback to patient record
  IF get_my_clinic_id() IS NOT NULL THEN
    v_clinic_id := get_my_clinic_id();
  ELSE
    SELECT clinic_id INTO v_clinic_id FROM public.patients WHERE id = p_patient_id;
  END IF;

  IF v_clinic_id IS NULL THEN
    v_clinic_id := 1;
  END IF;

  -- Verify patient clinic ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.patients 
    WHERE id = p_patient_id AND clinic_id = v_clinic_id
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    pd.medicine_id,
    m.name AS medicine_name,
    m.packing_spec,
    COUNT(*)::BIGINT AS times_prescribed
  FROM public.prescription_details pd
  JOIN public.prescriptions_header ph ON pd.prescription_header_id = ph.id
  JOIN public.medicines m ON pd.medicine_id = m.id
  WHERE ph.patient_id = p_patient_id
    AND ph.clinic_id = v_clinic_id
    AND m.clinic_id = v_clinic_id
  GROUP BY pd.medicine_id, m.name, m.packing_spec
  ORDER BY times_prescribed DESC, m.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_medicine_usage_by_patient(BIGINT) TO authenticated, service_role;

