-- Migration: 20261102000004_search_medicines_rpc.sql
-- Description: Phase 05 - Debounced server search with pg_trgm & unaccent

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create immutable unaccent wrapper function for indexing if not exists
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text AS $$
  SELECT lower(public.unaccent('public.unaccent', $1));
$$ LANGUAGE sql IMMUTABLE STRICT;

-- GIN index for fast unaccented trigram search on medicines.name
CREATE INDEX IF NOT EXISTS idx_medicines_name_unaccent_trgm
ON public.medicines USING gin (public.f_unaccent(name) gin_trgm_ops);

-- Index on clinic_id and is_active for tenant isolation
CREATE INDEX IF NOT EXISTS idx_medicines_clinic_active
ON public.medicines (clinic_id, is_active);

-- RPC for bounded server-side medicine search
CREATE OR REPLACE FUNCTION public.search_medicines_v2(
  p_clinic_id bigint,
  p_query text DEFAULT '',
  p_limit int DEFAULT 20,
  p_exclude_ids bigint[] DEFAULT ARRAY[]::bigint[]
)
RETURNS TABLE (
  id bigint,
  name text,
  packing_spec text,
  unit text,
  price numeric,
  stock_quantity integer,
  min_stock_level integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit int := LEAST(COALESCE(p_limit, 20), 20);
  v_query text := TRIM(COALESCE(p_query, ''));
  v_unaccent_query text;
BEGIN
  IF v_query = '' THEN
    RETURN QUERY
    SELECT 
      m.id,
      m.name,
      m.packing_spec,
      m.unit,
      m.price,
      m.stock_quantity,
      m.min_stock_level,
      m.is_active
    FROM public.medicines m
    WHERE m.clinic_id = p_clinic_id
      AND m.is_active = true
      AND (p_exclude_ids IS NULL OR cardinality(p_exclude_ids) = 0 OR NOT (m.id = ANY(p_exclude_ids)))
    ORDER BY m.name ASC
    LIMIT v_limit;
  ELSE
    v_unaccent_query := public.f_unaccent(v_query);
    RETURN QUERY
    SELECT 
      m.id,
      m.name,
      m.packing_spec,
      m.unit,
      m.price,
      m.stock_quantity,
      m.min_stock_level,
      m.is_active
    FROM public.medicines m
    WHERE m.clinic_id = p_clinic_id
      AND m.is_active = true
      AND (p_exclude_ids IS NULL OR cardinality(p_exclude_ids) = 0 OR NOT (m.id = ANY(p_exclude_ids)))
      AND (
        public.f_unaccent(m.name) ILIKE '%' || v_unaccent_query || '%'
        OR (m.name_normalized IS NOT NULL AND m.name_normalized ILIKE '%' || v_unaccent_query || '%')
      )
    ORDER BY 
      CASE WHEN public.f_unaccent(m.name) ILIKE v_unaccent_query || '%' THEN 0 ELSE 1 END,
      m.name ASC
    LIMIT v_limit;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.search_medicines_v2 FROM anon, public;
GRANT EXECUTE ON FUNCTION public.search_medicines_v2 TO authenticated, service_role;

