-- Migration: Fix low-stock RPC to accept clinic_id parameter and verify membership
-- Description: Updates get_low_stock_medicines RPC to avoid JWT dependency issues

-- 1. Create the new overloaded function with p_clinic_id parameter
CREATE OR REPLACE FUNCTION public.get_low_stock_medicines(p_clinic_id bigint)
RETURNS SETOF public.medicines
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as creator to bypass RLS, but we check membership
SET search_path = public
AS $$
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if p_clinic_id is null
    IF p_clinic_id IS NULL THEN
        RAISE EXCEPTION 'clinic_id missing';
    END IF;

    -- Verify that the user belongs to this clinic
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND clinic_id = p_clinic_id
    ) THEN
        RAISE EXCEPTION 'Not authorized for clinic';
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.medicines
    WHERE clinic_id = p_clinic_id
      AND is_active = true
      AND stock_quantity <= min_stock_level;
END;
$$;

-- 2. Revoke execute privileges from public/anon and grant to authenticated
REVOKE EXECUTE ON FUNCTION public.get_low_stock_medicines(bigint) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_low_stock_medicines(bigint) TO authenticated;
