-- Migration: 20261103000006_fix_p2_medium_issues.sql
-- Description: Fix P2 medium performance issues
-- 1. PERF-010: Drop duplicate index on prescriptions_header
-- 2. PERF-008: Fix get_patient_dobs_by_time for 'all' filter type
-- 3. PERF-009: Consolidate multiple permissive RLS policies on core tables
-- 4. PERF-013: Add generated column is_low_stock & indexes for server-side filtering

-- ========================================================
-- 1. PERF-010: Drop duplicate index on prescriptions_header
-- ========================================================
DROP INDEX IF EXISTS public.idx_prescriptions_patient_date_desc;

-- ========================================================
-- 2. PERF-008: Restore 'all' filter type in get_patient_dobs_by_time
-- ========================================================
CREATE OR REPLACE FUNCTION public.get_patient_dobs_by_time(
  p_filter_type text, 
  p_time_value text DEFAULT ''
)
RETURNS TABLE(dob text) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
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
  ELSIF p_filter_type = 'all' THEN
    RETURN QUERY
    SELECT p.dob
    FROM patients p
    WHERE p.clinic_id = get_my_clinic_id()
      AND p.dob IS NOT NULL;
  END IF;
END;
$$;

-- ========================================================
-- 3. PERF-009: Consolidate Multiple Permissive Policies & InitPlan
-- ========================================================

-- 3.1 clinic_daily_stats
DROP POLICY IF EXISTS "Clinic members can view their daily stats" ON public.clinic_daily_stats;
DROP POLICY IF EXISTS "Users can view their own clinic's stats" ON public.clinic_daily_stats;
-- "Users can manage their own clinic's stats" (ALL) remains as the single authoritative policy.

-- 3.2 prescriptions_header
DROP POLICY IF EXISTS "Users can see prescriptions in their clinic" ON public.prescriptions_header;
-- "Users can manage prescriptions in their clinic" (ALL) remains as the single authoritative policy.

-- 3.3 medicines
DROP POLICY IF EXISTS "Admins/Doctors can manage medicines" ON public.medicines;

CREATE POLICY "Admins/Doctors can insert medicines" ON public.medicines
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = ANY (ARRAY['admin'::user_role, 'doctor'::user_role])
  );

CREATE POLICY "Admins/Doctors can update medicines" ON public.medicines
  FOR UPDATE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = ANY (ARRAY['admin'::user_role, 'doctor'::user_role])
  )
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = ANY (ARRAY['admin'::user_role, 'doctor'::user_role])
  );

CREATE POLICY "Admins/Doctors can delete medicines" ON public.medicines
  FOR DELETE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = ANY (ARRAY['admin'::user_role, 'doctor'::user_role])
  );

-- 3.4 inventory_transaction_logs
DROP POLICY IF EXISTS "Admins can manage inventory logs" ON public.inventory_transaction_logs;

CREATE POLICY "Admins can insert inventory logs" ON public.inventory_transaction_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

CREATE POLICY "Admins can update inventory logs" ON public.inventory_transaction_logs
  FOR UPDATE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  )
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

CREATE POLICY "Admins can delete inventory logs" ON public.inventory_transaction_logs
  FOR DELETE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

-- 3.5 settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Admins can insert settings" ON public.settings
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  )
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

CREATE POLICY "Admins can delete settings" ON public.settings
  FOR DELETE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

-- 3.6 profiles
DROP POLICY IF EXISTS "Admins can view all profiles in clinic" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile name" ON public.profiles;

CREATE POLICY "Users can view own or clinic profiles if admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (clinic_id = get_my_clinic_id() AND get_my_role() = 'admin'::user_role)
  );

CREATE POLICY "Users can update own or clinic profiles if admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (clinic_id = get_my_clinic_id() AND get_my_role() = 'admin'::user_role)
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (clinic_id = get_my_clinic_id() AND get_my_role() = 'admin'::user_role)
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    clinic_id = get_my_clinic_id() 
    AND get_my_role() = 'admin'::user_role
  );

-- ========================================================
-- 4. PERF-013: Generated Column & Partial Indexes for Stock Filtering
-- ========================================================
ALTER TABLE public.medicines 
ADD COLUMN IF NOT EXISTS is_low_stock boolean 
GENERATED ALWAYS AS (stock_quantity > 0 AND stock_quantity <= COALESCE(min_stock_level, 0)) STORED;

CREATE INDEX IF NOT EXISTS idx_medicines_low_stock 
ON public.medicines (clinic_id) 
WHERE is_active = true AND is_low_stock = true;

CREATE INDEX IF NOT EXISTS idx_medicines_out_of_stock 
ON public.medicines (clinic_id) 
WHERE is_active = true AND stock_quantity = 0;

