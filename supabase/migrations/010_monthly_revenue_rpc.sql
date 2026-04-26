-- Create a function to calculate monthly revenue efficiently
CREATE OR REPLACE FUNCTION get_monthly_revenue_total()
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM prescriptions_header
    WHERE prescription_date >= date_trunc('month', CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql STABLE;
