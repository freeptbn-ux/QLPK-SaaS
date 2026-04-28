-- Migration: Create get_patients_with_last_visit function
-- Description: Trả về danh sách bệnh nhân kèm ngày khám cuối cùng, hỗ trợ tìm kiếm và phân trang.

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
  WITH patient_visits AS (
    SELECT 
      ph.patient_id,
      MAX(ph.prescription_date) AS last_visit_date
    FROM public.prescriptions_header ph
    GROUP BY ph.patient_id
  ),
  filtered_patients AS (
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
    pv.last_visit_date,
    COUNT(*) OVER() AS total_count
  FROM filtered_patients fp
  LEFT JOIN patient_visits pv ON fp.id = pv.patient_id
  ORDER BY pv.last_visit_date DESC NULLS LAST, fp.id DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;
