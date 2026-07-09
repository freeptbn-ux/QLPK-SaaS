-- ============================================================
-- Phase 01 Verification — RLS Status + Anon Privileges
-- Run via Supabase MCP execute_sql or SQL Editor
-- Expected: All checks return pass results, no exceptions raised
-- ============================================================

-- CHECK 1: RLS must be enabled on all 4 tables
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  CASE WHEN rowsecurity THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'medicines', 'prescriptions_header', 'prescription_details')
ORDER BY tablename;

-- CHECK 2: anon must have NO privileges on sensitive tables
SELECT
  table_name,
  COUNT(*) AS privilege_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL — anon still has privileges!' END AS status
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND table_name IN (
    'patients', 'medicines', 'prescriptions_header', 'prescription_details',
    'clinic_daily_stats', 'medicine_dosage_cache', 'legacy_prescription_images'
  )
GROUP BY table_name;

-- CHECK 3: RLS policies still exist (must not have been dropped)
SELECT
  tablename,
  COUNT(*) AS policy_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL — policies missing!' END AS status
FROM pg_policies
WHERE tablename IN ('patients', 'medicines', 'prescriptions_header', 'prescription_details')
GROUP BY tablename
ORDER BY tablename;

-- CHECK 4: authenticated role still has grants (app must still work)
SELECT
  table_name,
  array_agg(privilege_type ORDER BY privilege_type) AS privileges,
  '✅ OK' AS status
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
  AND table_schema = 'public'
  AND table_name IN ('patients', 'medicines')
GROUP BY table_name;
