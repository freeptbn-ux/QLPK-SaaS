-- Phase 01: Fix Statistics RPCs to enforce clinic-level isolation
-- Created: 2026-05-10
-- Requirement: Update Statistics RPCs to filter by clinic_id = get_my_clinic_id()

-- 1. get_stats_by_day_for_month
CREATE OR REPLACE FUNCTION get_stats_by_day_for_month(p_year_month text)
RETURNS TABLE(name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(prescription_date, 'DD/MM') AS name,
    COUNT(*) AS count
  FROM prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
    AND prescription_date >= (p_year_month || '-01')::date
    AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  GROUP BY to_char(prescription_date, 'DD/MM'), prescription_date::date
  ORDER BY prescription_date::date ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. get_stats_by_week
CREATE OR REPLACE FUNCTION get_stats_by_week(p_limit int DEFAULT 8)
RETURNS TABLE(name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'W' || EXTRACT(WEEK FROM prescription_date)::text || '/' || EXTRACT(YEAR FROM prescription_date)::text AS name,
    COUNT(*) AS count
  FROM prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
  GROUP BY EXTRACT(WEEK FROM prescription_date), EXTRACT(YEAR FROM prescription_date), 
           DATE_TRUNC('week', prescription_date)
  ORDER BY DATE_TRUNC('week', prescription_date) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. get_stats_by_month
CREATE OR REPLACE FUNCTION get_stats_by_month(p_limit int DEFAULT 12)
RETURNS TABLE(name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(prescription_date, 'MM/YYYY') AS name,
    COUNT(*) AS count
  FROM prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
  GROUP BY to_char(prescription_date, 'MM/YYYY'), DATE_TRUNC('month', prescription_date)
  ORDER BY DATE_TRUNC('month', prescription_date) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. get_stats_by_year
CREATE OR REPLACE FUNCTION get_stats_by_year()
RETURNS TABLE(name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(YEAR FROM prescription_date)::text AS name,
    COUNT(*) AS count
  FROM prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
  GROUP BY EXTRACT(YEAR FROM prescription_date)
  ORDER BY EXTRACT(YEAR FROM prescription_date) ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. get_stats_by_gender
CREATE OR REPLACE FUNCTION get_stats_by_gender()
RETURNS TABLE(name text, value bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(gender, 'Không xác định') AS name,
    COUNT(*) AS value
  FROM patients
  WHERE clinic_id = get_my_clinic_id()
  GROUP BY gender;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. get_stats_by_location
CREATE OR REPLACE FUNCTION get_stats_by_location(p_limit int DEFAULT 20)
RETURNS TABLE(name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(address, 'Không xác định') AS name,
    COUNT(*) AS count
  FROM patients
  WHERE clinic_id = get_my_clinic_id()
  GROUP BY address
  ORDER BY COUNT(*) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. get_medicine_usage_stats
CREATE OR REPLACE FUNCTION get_medicine_usage_stats(p_year_month text DEFAULT NULL)
RETURNS TABLE(name text, "totalQuantity" bigint, "totalRevenue" numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.name,
    SUM(pd.quantity)::bigint AS "totalQuantity",
    SUM((pd.quantity * pd.unit_price)::numeric) AS "totalRevenue"
  FROM prescription_details pd
  INNER JOIN medicines m ON m.id = pd.medicine_id
  LEFT JOIN prescriptions_header ph ON ph.id = pd.prescription_header_id
  WHERE ph.clinic_id = get_my_clinic_id()
    AND (p_year_month IS NULL OR (
    ph.prescription_date >= (p_year_month || '-01')::date
    AND ph.prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  ))
  GROUP BY m.name
  ORDER BY SUM(pd.quantity) DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. get_revenue_stats
CREATE OR REPLACE FUNCTION get_revenue_stats(p_year_month text DEFAULT NULL)
RETURNS TABLE(name text, revenue numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(prescription_date, 'MM/YYYY') AS name,
    SUM(COALESCE(total_amount, 0)::numeric) AS revenue
  FROM prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
    AND (p_year_month IS NULL OR (
    prescription_date >= (p_year_month || '-01')::date
    AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  ))
  GROUP BY to_char(prescription_date, 'MM/YYYY'), DATE_TRUNC('month', prescription_date)
  ORDER BY DATE_TRUNC('month', prescription_date) ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. get_distinct_months_years
CREATE OR REPLACE FUNCTION get_distinct_months_years()
RETURNS TABLE(month text) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    to_char(prescription_date, 'YYYY-MM') AS month
  FROM prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 10. get_low_stock_count
CREATE OR REPLACE FUNCTION get_low_stock_count()
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM medicines 
    WHERE clinic_id = get_my_clinic_id()
      AND stock_quantity <= min_stock_level
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 11. get_patient_dobs_by_time
CREATE OR REPLACE FUNCTION get_patient_dobs_by_time(p_filter_type text, p_time_value text)
RETURNS TABLE(dob text) AS $$
BEGIN
  IF p_filter_type = 'month' THEN
    RETURN QUERY
    SELECT p.dob
    FROM prescriptions_header ph
    JOIN patients p ON p.id = ph.patient_id
    WHERE ph.clinic_id = get_my_clinic_id()
    AND to_char(ph.prescription_date, 'YYYY-MM') = p_time_value
    AND p.dob IS NOT NULL;
  ELSIF p_filter_type = 'year' THEN
    RETURN QUERY
    SELECT p.dob
    FROM prescriptions_header ph
    JOIN patients p ON p.id = ph.patient_id
    WHERE ph.clinic_id = get_my_clinic_id()
    AND to_char(ph.prescription_date, 'YYYY') = p_time_value
    AND p.dob IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 12. get_monthly_revenue_total
CREATE OR REPLACE FUNCTION get_monthly_revenue_total()
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM prescriptions_header
    WHERE clinic_id = get_my_clinic_id()
      AND prescription_date >= date_trunc('month', CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
