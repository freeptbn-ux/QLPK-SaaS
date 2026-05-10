-- Migration: Add medicine RPCs and optimize backend queries
-- Description: Adds get_low_stock_medicines RPC and revokes anon access

-- 1. Create get_low_stock_medicines RPC
CREATE OR REPLACE FUNCTION public.get_low_stock_medicines()
RETURNS SETOF public.medicines
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as creator to bypass RLS if needed, but we check clinic_id
SET search_path = public
AS $$
DECLARE
    v_clinic_id BIGINT;
BEGIN
    -- Get current user's clinic_id from session/JWT
    v_clinic_id := (auth.jwt() ->> 'clinic_id')::BIGINT;
    
    IF v_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated or clinic_id missing';
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.medicines
    WHERE clinic_id = v_clinic_id
      AND stock_quantity <= min_stock_level;
END;
$$;

-- 2. Revoke public access to the RPC
REVOKE EXECUTE ON FUNCTION public.get_low_stock_medicines() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_low_stock_medicines() TO authenticated;

-- 3. Optimization: Add index for low stock queries if not exists
CREATE INDEX IF NOT EXISTS idx_medicines_low_stock 
ON public.medicines (clinic_id, stock_quantity, min_stock_level);
