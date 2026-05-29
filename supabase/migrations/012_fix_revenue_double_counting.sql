-- Phase 02: Fix Revenue Double-Counting
-- Objective: Remove consultation_fee from revenue calculation because total_amount already includes it.

CREATE OR REPLACE FUNCTION get_revenue_stats(p_year_month text DEFAULT NULL)
RETURNS TABLE(name text, revenue numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(prescription_date, 'MM/YYYY') AS name,
    SUM(COALESCE(total_amount, 0)::numeric) AS revenue
  FROM prescriptions_header
  WHERE (p_year_month IS NULL OR (
    prescription_date >= (p_year_month || '-01')::date
    AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  ))
  GROUP BY to_char(prescription_date, 'MM/YYYY'), DATE_TRUNC('month', prescription_date)
  ORDER BY DATE_TRUNC('month', prescription_date) ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions (Idempotent)
GRANT EXECUTE ON FUNCTION get_revenue_stats(text) TO anon, authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
