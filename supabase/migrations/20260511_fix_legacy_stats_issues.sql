-- Migration: Fix Legacy Statistics Issues
-- Created At: 2026-05-11
-- Description: Fix ISO week format and medicine usage stats join

-- 1. Fix ISO week in get_stats_by_week
CREATE OR REPLACE FUNCTION get_stats_by_week(p_limit int DEFAULT 8)
RETURNS TABLE(name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(prescription_date, 'IYYY-"W"IW') AS name, -- Format YYYY-WIW for better readability
    COUNT(*) AS count
  FROM public.prescriptions_header
  WHERE clinic_id = get_my_clinic_id()
  GROUP BY to_char(prescription_date, 'IYYY-"W"IW'), DATE_TRUNC('week', prescription_date)
  ORDER BY DATE_TRUNC('week', prescription_date) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Fix medicine usage stats with LEFT JOIN to preserve historical data
CREATE OR REPLACE FUNCTION get_medicine_usage_stats(p_year_month text DEFAULT NULL)
RETURNS TABLE(name text, "totalQuantity" bigint, "totalRevenue" numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(m.name, 'Thuốc đã xóa (' || pd.medicine_id || ')') as name,
    SUM(pd.quantity)::bigint AS "totalQuantity",
    SUM((pd.quantity * pd.unit_price)::numeric) AS "totalRevenue"
  FROM public.prescription_details pd
  LEFT JOIN public.medicines m ON m.id = pd.medicine_id
  LEFT JOIN public.prescriptions_header ph ON ph.id = pd.prescription_header_id
  WHERE ph.clinic_id = get_my_clinic_id()
    AND (p_year_month IS NULL OR (
    ph.prescription_date >= (p_year_month || '-01')::date
    AND ph.prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  ))
  GROUP BY COALESCE(m.name, 'Thuốc đã xóa (' || pd.medicine_id || ')')
  ORDER BY SUM(pd.quantity) DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
