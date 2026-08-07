-- Update get_low_stock_count() to exclude stock_quantity = 0
CREATE OR REPLACE FUNCTION get_low_stock_count()
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM medicines
    WHERE clinic_id = get_my_clinic_id()
      AND is_active = true
      AND stock_quantity > 0
      AND stock_quantity <= min_stock_level
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create get_out_of_stock_count() to count stock_quantity = 0
CREATE OR REPLACE FUNCTION get_out_of_stock_count()
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM medicines
    WHERE clinic_id = get_my_clinic_id()
      AND is_active = true
      AND stock_quantity = 0
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update get_low_stock_medicines(p_clinic_id) to exclude stock_quantity = 0
CREATE OR REPLACE FUNCTION get_low_stock_medicines(p_clinic_id bigint)
RETURNS SETOF public.medicines
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_clinic_id IS NULL THEN RAISE EXCEPTION 'clinic_id missing'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND clinic_id = p_clinic_id
  ) THEN RAISE EXCEPTION 'Not authorized for clinic'; END IF;

  RETURN QUERY
  SELECT * FROM public.medicines
  WHERE clinic_id = p_clinic_id
    AND is_active = true
    AND stock_quantity > 0
    AND stock_quantity <= min_stock_level;
END;
$$;

-- Grant permissions for get_out_of_stock_count
REVOKE EXECUTE ON FUNCTION get_out_of_stock_count() FROM public, anon;
GRANT EXECUTE ON FUNCTION get_out_of_stock_count() TO authenticated;
