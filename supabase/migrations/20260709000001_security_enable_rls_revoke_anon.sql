-- =============================================================================
-- Migration: Enable RLS + Revoke anon Privileges
-- Date: 2026-07-09
-- Audit Issues: #1 (RLS disabled), #2 (anon full access)
-- =============================================================================

-- PART 1: Enable RLS on the 4 tables that have it disabled
-- Policies already exist from 20260427181500_rls_redesign.sql et al.
-- Enabling RLS will immediately activate them.
ALTER TABLE public.patients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions_header  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_details  ENABLE ROW LEVEL SECURITY;

-- PART 2: Revoke explicit grants from the anon role on sensitive tables.
-- Defense in depth: even if a future migration accidentally re-grants access,
-- the RLS policies above (scoped to `authenticated` role only) will still block anon.
REVOKE ALL ON public.patients              FROM anon;
REVOKE ALL ON public.medicines             FROM anon;
REVOKE ALL ON public.prescriptions_header  FROM anon;
REVOKE ALL ON public.prescription_details  FROM anon;
REVOKE ALL ON public.clinic_daily_stats    FROM anon;
REVOKE ALL ON public.medicine_dosage_cache FROM anon;
REVOKE ALL ON public.legacy_prescription_images FROM anon;

-- Keep USAGE on schema so Supabase auth flows still work
GRANT USAGE ON SCHEMA public TO anon;

-- Sanity check: verify RLS is now enabled (will error if not)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('patients', 'medicines', 'prescriptions_header', 'prescription_details')
      AND NOT rowsecurity
  ) THEN
    RAISE EXCEPTION 'MIGRATION FAILED: RLS is still disabled on one or more tables!';
  END IF;
END $$;
