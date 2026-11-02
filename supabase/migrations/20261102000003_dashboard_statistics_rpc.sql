-- Migration: 20261102000003_dashboard_statistics_rpc.sql
-- Description: Unified RPC to eliminate dashboard statistics waterfall (PERF-006)

CREATE OR REPLACE FUNCTION public.get_dashboard_statistics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_clinic_id BIGINT DEFAULT NULL,
  p_time_range TEXT DEFAULT 'day'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id BIGINT;
  v_start_date DATE;
  v_end_date DATE;
  v_result JSONB;
BEGIN
  -- 1. Clinic isolation enforcement
  v_clinic_id := COALESCE(p_clinic_id, get_my_clinic_id());
  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Clinic ID required';
  END IF;

  -- 2. Determine date bounds based on parameters or time range presets
  IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    v_start_date := p_start_date;
    v_end_date := p_end_date;
  ELSIF p_start_date IS NOT NULL THEN
    v_start_date := p_start_date;
    v_end_date := CURRENT_DATE;
  ELSE
    IF p_time_range = 'week' THEN
      v_start_date := (CURRENT_DATE - INTERVAL '8 weeks')::DATE;
      v_end_date := CURRENT_DATE;
    ELSIF p_time_range = 'month' THEN
      v_start_date := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months')::DATE;
      v_end_date := CURRENT_DATE;
    ELSIF p_time_range = 'year' THEN
      v_start_date := (DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '5 years')::DATE;
      v_end_date := CURRENT_DATE;
    ELSE
      -- 'day' or default: current calendar month
      v_start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
      v_end_date := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    END IF;
  END IF;

  -- 3. Construct unified JSON payload in a single round-trip
  SELECT jsonb_build_object(
    -- Financial KPIs
    'kpis', (
      SELECT jsonb_build_object(
        'total_revenue', COALESCE(SUM(total_revenue), 0),
        'prescription_count', COALESCE(SUM(prescription_count), 0),
        'patient_visit_count', COALESCE(SUM(visit_count), 0),
        'avg_prescription_value', CASE 
          WHEN COALESCE(SUM(prescription_count), 0) > 0 
          THEN ROUND(COALESCE(SUM(total_revenue), 0) / SUM(prescription_count))
          ELSE 0 
        END
      )
      FROM clinic_daily_stats
      WHERE clinic_id = v_clinic_id
        AND date >= v_start_date
        AND date <= v_end_date
    ),

    -- Date-series trend data
    'revenue_trends', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', to_char(date, 'YYYY-MM-DD'),
          'name', to_char(date, 'DD/MM'),
          'revenue', COALESCE(total_revenue, 0),
          'visits', COALESCE(visit_count, 0),
          'count', COALESCE(visit_count, 0)
        ) ORDER BY date ASC
      )
      FROM clinic_daily_stats
      WHERE clinic_id = v_clinic_id
        AND date >= v_start_date
        AND date <= v_end_date
    ), '[]'::jsonb),

    -- Top prescribed medicines
    'top_medicines', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', sub.name,
          'total_quantity', sub.total_quantity,
          'total_revenue', sub.total_revenue,
          'totalQuantity', sub.total_quantity,
          'totalRevenue', sub.total_revenue
        )
      )
      FROM (
        SELECT 
          m.name,
          SUM(pd.quantity)::BIGINT AS total_quantity,
          SUM((pd.quantity * pd.unit_price)::NUMERIC) AS total_revenue
        FROM prescription_details pd
        JOIN prescriptions_header ph ON ph.id = pd.prescription_header_id
        JOIN medicines m ON m.id = pd.medicine_id
        WHERE ph.clinic_id = v_clinic_id
          AND ph.prescription_date::DATE >= v_start_date
          AND ph.prescription_date::DATE <= v_end_date
        GROUP BY m.name
        ORDER BY SUM(pd.quantity) DESC
        LIMIT 10
      ) sub
    ), '[]'::jsonb),

    -- Demographics breakdown
    'demographics', jsonb_build_object(
      'gender', jsonb_build_object(
        'male', COALESCE((SELECT COUNT(*) FROM patients WHERE clinic_id = v_clinic_id AND LOWER(gender) IN ('male', 'nam')), 0),
        'female', COALESCE((SELECT COUNT(*) FROM patients WHERE clinic_id = v_clinic_id AND LOWER(gender) IN ('female', 'nữ', 'nu')), 0),
        'other', COALESCE((SELECT COUNT(*) FROM patients WHERE clinic_id = v_clinic_id AND (gender IS NULL OR LOWER(gender) NOT IN ('male', 'nam', 'female', 'nữ', 'nu'))), 0)
      ),
      'gender_distribution', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', COALESCE(gender, 'Không xác định'),
            'value', cnt
          )
        )
        FROM (
          SELECT gender, COUNT(*) AS cnt
          FROM patients
          WHERE clinic_id = v_clinic_id
          GROUP BY gender
        ) g
      ), '[]'::jsonb),
      'age_groups', jsonb_build_object(
        'under_18', COALESCE((
          SELECT COUNT(*) FROM patients 
          WHERE clinic_id = v_clinic_id 
            AND dob ~ '^\d{4}'
            AND (DATE_PART('year', CURRENT_DATE) - SUBSTRING(dob FROM '^\d{4}')::INT) < 18
        ), 0),
        'adult', COALESCE((
          SELECT COUNT(*) FROM patients 
          WHERE clinic_id = v_clinic_id 
            AND dob ~ '^\d{4}'
            AND (DATE_PART('year', CURRENT_DATE) - SUBSTRING(dob FROM '^\d{4}')::INT) BETWEEN 18 AND 60
        ), 0),
        'elderly', COALESCE((
          SELECT COUNT(*) FROM patients 
          WHERE clinic_id = v_clinic_id 
            AND dob ~ '^\d{4}'
            AND (DATE_PART('year', CURRENT_DATE) - SUBSTRING(dob FROM '^\d{4}')::INT) > 60
        ), 0)
      ),
      'dob_list', COALESCE((
        SELECT jsonb_agg(p.dob)
        FROM prescriptions_header ph
        JOIN patients p ON p.id = ph.patient_id
        WHERE ph.clinic_id = v_clinic_id
          AND ph.prescription_date::DATE >= v_start_date
          AND ph.prescription_date::DATE <= v_end_date
          AND p.dob IS NOT NULL
      ), '[]'::jsonb)
    ),

    -- Overview stats
    'overview', jsonb_build_object(
      'totalPatients', COALESCE((SELECT COUNT(*) FROM patients WHERE clinic_id = v_clinic_id), 0),
      'monthlyVisits', COALESCE((
        SELECT SUM(visit_count) FROM clinic_daily_stats 
        WHERE clinic_id = v_clinic_id AND date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
      ), 0),
      'monthlyRevenue', COALESCE((
        SELECT SUM(total_revenue) FROM clinic_daily_stats 
        WHERE clinic_id = v_clinic_id AND date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
      ), 0),
      'lowStockCount', COALESCE((
        SELECT COUNT(*) FROM medicines 
        WHERE clinic_id = v_clinic_id AND is_active = true AND stock_quantity <= min_stock_level
      ), 0),
      'outOfStockCount', COALESCE((
        SELECT COUNT(*) FROM medicines 
        WHERE clinic_id = v_clinic_id AND is_active = true AND stock_quantity = 0
      ), 0)
    ),

    -- Available months
    'available_months', COALESCE((
      SELECT jsonb_agg(m.month)
      FROM (
        SELECT DISTINCT to_char(date, 'YYYY-MM') AS month
        FROM clinic_daily_stats
        WHERE clinic_id = v_clinic_id
        ORDER BY month DESC
      ) m
    ), '[]'::jsonb),

    -- Top patient locations
    'locations', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', COALESCE(address, 'Không xác định'),
          'count', cnt
        )
      )
      FROM (
        SELECT address, COUNT(*) AS cnt
        FROM patients
        WHERE clinic_id = v_clinic_id
        GROUP BY address
        ORDER BY COUNT(*) DESC
        LIMIT 20
      ) loc
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_statistics(DATE, DATE, BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_statistics(DATE, DATE, BIGINT, TEXT) TO service_role;

