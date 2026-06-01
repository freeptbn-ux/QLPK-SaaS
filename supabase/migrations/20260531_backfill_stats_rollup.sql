-- Phase 02: Recalculate clinic_daily_stats from prescriptions_header
-- using timezone-aware date casting to fix accumulated drift.

-- Step 1: Wipe stale data
TRUNCATE public.clinic_daily_stats;

-- Step 2: Re-aggregate from source of truth
INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
SELECT
    clinic_id,
    (prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AS date,
    COUNT(*) AS visit_count,
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM public.prescriptions_header
GROUP BY clinic_id, (prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE
ON CONFLICT (clinic_id, date) DO UPDATE
SET visit_count = EXCLUDED.visit_count,
    total_revenue = EXCLUDED.total_revenue;
