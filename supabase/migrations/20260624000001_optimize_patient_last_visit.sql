-- 1. Add column to patients table
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMPTZ;

-- 2. Backfill existing patient data
UPDATE public.patients p
SET last_visit_date = (
  SELECT MAX(ph.prescription_date)
  FROM public.prescriptions_header ph
  WHERE ph.patient_id = p.id
);

-- 3. Create composite index for sorting
CREATE INDEX IF NOT EXISTS idx_patients_last_visit_sorting 
ON public.patients (last_visit_date DESC NULLS LAST, id DESC);

-- 4. Create trigger function to sync last_visit_date
CREATE OR REPLACE FUNCTION update_patient_last_visit_date()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.patients
    SET last_visit_date = (
      SELECT MAX(prescription_date)
      FROM public.prescriptions_header
      WHERE patient_id = NEW.patient_id
    )
    WHERE id = NEW.patient_id;
    
    IF TG_OP = 'UPDATE' AND OLD.patient_id <> NEW.patient_id THEN
      UPDATE public.patients
      SET last_visit_date = (
        SELECT MAX(prescription_date)
        FROM public.prescriptions_header
        WHERE patient_id = OLD.patient_id
      )
      WHERE id = OLD.patient_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.patients
    SET last_visit_date = (
      SELECT MAX(prescription_date)
      FROM public.prescriptions_header
      WHERE patient_id = OLD.patient_id
    )
    WHERE id = OLD.patient_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger
DROP TRIGGER IF EXISTS trg_update_patient_last_visit ON public.prescriptions_header;
CREATE TRIGGER trg_update_patient_last_visit
AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions_header
FOR EACH ROW EXECUTE FUNCTION update_patient_last_visit_date();

-- 6. Refactor RPC get_patients_with_last_visit
CREATE OR REPLACE FUNCTION get_patients_with_last_visit(
  p_search_term TEXT DEFAULT NULL,
  p_search_normalized TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  dob TEXT,
  gender TEXT,
  address TEXT,
  phone TEXT,
  weight TEXT,
  medical_history TEXT,
  diagnosis TEXT,
  created_at TIMESTAMPTZ,
  name_normalized TEXT,
  updated_at TIMESTAMPTZ,
  clinic_id BIGINT,
  last_visit_date TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH filtered_patients AS (
    SELECT p.*
    FROM public.patients p
    WHERE (
      p_search_term IS NULL 
      OR p_search_term = '' 
      OR p.name_normalized ILIKE '%' || p_search_normalized || '%'
      OR p.phone ILIKE '%' || p_search_term || '%'
    )
  )
  SELECT 
    fp.id,
    fp.name,
    fp.dob,
    fp.gender,
    fp.address,
    fp.phone,
    fp.weight,
    fp.medical_history,
    fp.diagnosis,
    fp.created_at,
    fp.name_normalized,
    fp.updated_at,
    fp.clinic_id,
    fp.last_visit_date,
    COUNT(*) OVER() AS total_count
  FROM filtered_patients fp
  ORDER BY fp.last_visit_date DESC NULLS LAST, fp.id DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;
