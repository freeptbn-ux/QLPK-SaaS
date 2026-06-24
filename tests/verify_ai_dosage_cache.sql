-- tests/verify_ai_dosage_cache.sql
BEGIN;

-- Verify table exists
SELECT count(*) = 1 AS table_exists 
FROM information_schema.tables 
WHERE table_name = 'medicine_dosage_cache';

-- Check RLS settings
SELECT relrowsecurity AS rls_enabled 
FROM pg_class 
WHERE relname = 'medicine_dosage_cache';

-- Test INSERT policy
SET LOCAL request.jwt.claims TO '{"role":"authenticated"}';
INSERT INTO public.medicine_dosage_cache 
(medicine_name_query, medicine_name, adult_dosage, children_dosage, usage_instructions, description, contraindications, side_effects)
VALUES 
('test_med', 'Test Med', '1 pill', '0.5 pill', 'After meal', 'Generic info', 'None', 'Drowsiness');

SELECT count(*) = 1 AS authenticated_can_insert 
FROM public.medicine_dosage_cache WHERE medicine_name_query = 'test_med';

ROLLBACK;
