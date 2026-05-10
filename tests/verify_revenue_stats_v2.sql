-- Verification script for get_revenue_stats_v2
-- Run this in Supabase SQL Editor or via execute_sql tool

-- 1. Test Day Granularity (assuming there is data in May 2026 or whatever is in the DB)
-- First, find a month with data
SELECT to_char(prescription_date, 'YYYY-MM') as month, count(*) 
FROM prescriptions_header 
GROUP BY 1 
ORDER BY 1 DESC 
LIMIT 5;

-- Test 'day' for a specific month (e.g., '2026-05')
SELECT * FROM get_revenue_stats_v2('day', '2026-05');

-- 2. Test Week Granularity
SELECT * FROM get_revenue_stats_v2('week', NULL, 5);

-- 3. Test Month Granularity
SELECT * FROM get_revenue_stats_v2('month', NULL, 5);

-- 4. Test Year Granularity
SELECT * FROM get_revenue_stats_v2('year', NULL, 5);

-- 5. Verify calculation logic (sum of total_amount + consultation_fee)
-- Pick a random day from results and compare
WITH sample_day AS (
    SELECT prescription_date::date as d, SUM(COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)) as expected
    FROM prescriptions_header
    WHERE to_char(prescription_date, 'YYYY-MM') = '2026-05'
    GROUP BY 1
    ORDER BY 1
    LIMIT 1
)
SELECT 
    s.d, 
    s.expected, 
    r.revenue as rpc_revenue,
    (s.expected::numeric = r.revenue) as matches
FROM sample_day s
JOIN get_revenue_stats_v2('day', '2026-05') r ON r.name = to_char(s.d, 'DD/MM');
