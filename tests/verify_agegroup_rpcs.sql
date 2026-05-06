-- Verification for Phase 02: Fix AgeGroup RPCs

-- Test 1: filter_type='all' should not be empty
SELECT 'Test 1: filter_type=all' as test_name, COUNT(*) > 0 as passed, COUNT(*) as count
FROM get_patient_dobs_by_time('all', '');

-- Test 2: check for duplicates in a specific month (should have 0 rows with count > 1)
SELECT 'Test 2: no duplicates' as test_name, COUNT(*) = 0 as passed, COUNT(*) as duplicate_groups
FROM (
  SELECT dob, COUNT(*) 
  FROM get_patient_dobs_by_time('month', '2026-05')
  GROUP BY dob 
  HAVING COUNT(*) > 1
) sub;

-- Test 3: compare with raw patients table count for 'all'
SELECT 'Test 3: all matches patients count' as test_name, 
       (SELECT COUNT(*) FROM get_patient_dobs_by_time('all', '')) = (SELECT COUNT(DISTINCT dob) FROM patients WHERE dob IS NOT NULL) as passed;
