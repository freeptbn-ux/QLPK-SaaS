-- Migration: Add is_active filter to get_low_stock_count
-- Description: Syncs get_low_stock_count() with get_low_stock_medicines() by filtering only active medicines.
-- Without this, the Dashboard count could include soft-deleted medicines, causing a mismatch.

CREATE OR REPLACE FUNCTION get_low_stock_count()
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM medicines
    WHERE clinic_id = get_my_clinic_id()
      AND is_active = true
      AND stock_quantity <= min_stock_level
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
