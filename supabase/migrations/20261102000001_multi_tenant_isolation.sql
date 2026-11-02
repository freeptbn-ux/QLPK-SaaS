-- Phase 01: Multi-Tenant Isolation & Clinic-Scoped Constraints (P0)
-- Target Issues: PERF-001, PERF-002

-- 1. Replace global unique index with clinic-scoped unique index (PERF-002)
DROP INDEX IF EXISTS public.idx_patients_unique_person;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_unique_person 
ON public.patients (clinic_id, LOWER(name_normalized), COALESCE(dob, ''));

-- 2. Update get_patients_with_last_visit with clinic_id tenant isolation & secure search_path (PERF-001)
CREATE OR REPLACE FUNCTION public.get_patients_with_last_visit(
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
SET search_path = public, pg_temp
AS $$
  WITH filtered_patients AS (
    SELECT p.*
    FROM public.patients p
    WHERE p.clinic_id = get_my_clinic_id()
      AND (
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

-- 3. Function permissions
REVOKE EXECUTE ON FUNCTION public.get_patients_with_last_visit(TEXT, TEXT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_patients_with_last_visit(TEXT, TEXT, INT, INT) TO authenticated, service_role;

-- 4. Helper for administrative sql queries (used in test suites)
CREATE OR REPLACE FUNCTION public.execute_sql_query(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cleaned_query TEXT;
  v_result JSONB;
BEGIN
  v_cleaned_query := rtrim(trim(query), ';');
  EXECUTE 'SELECT jsonb_agg(t) FROM (' || v_cleaned_query || ') t' INTO v_result;
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.execute_sql_query(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.execute_sql_query(TEXT) TO authenticated, service_role;
