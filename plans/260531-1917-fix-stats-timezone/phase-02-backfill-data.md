# Phase 02: Backfill & Recalculate Data
**Status:** ✅ Completed  
**Dependencies:** Phase 01 (trigger must be fixed first)

## Objective
Recalculate all data in `clinic_daily_stats` from the source-of-truth table `prescriptions_header` using timezone-aware date casting. This eliminates the +2 phantom visit drift and any other accumulated data inconsistencies.

## Implementation Steps

### 1. Create backfill migration
- [x] Create `supabase/migrations/20260531_backfill_stats_rollup.sql`

### 2. Truncate stale rollup data
- [x] Wipe `clinic_daily_stats` to ensure a clean slate (no orphaned rows survive).

### 3. Re-aggregate from source of truth
- [x] Insert fresh aggregated data from `prescriptions_header` using `(prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE` for date grouping.

### 4. Verify row counts match
- [x] Run a verification query comparing `SUM(visit_count)` in rollup vs `COUNT(*)` in `prescriptions_header` per clinic. They must be equal.

## Files to Create/Modify
- `supabase/migrations/20260531_backfill_stats_rollup.sql` — New migration

## Complete Migration SQL
```sql
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
```

## Test Criteria — File: `src/test/stats-backfill-verify.test.ts`
This test file validates that the backfill produced correct data:

- [x] **Test 1: Total visit count matches prescription count** — `SELECT SUM(visit_count) FROM clinic_daily_stats WHERE clinic_id = X` must equal `SELECT COUNT(*) FROM prescriptions_header WHERE clinic_id = X` for every clinic.
- [x] **Test 2: No orphaned rollup rows** — Every `(clinic_id, date)` row in `clinic_daily_stats` must have at least one corresponding prescription in `prescriptions_header` on that same VN-timezone date.
- [x] **Test 3: No negative or zero visit counts** — `SELECT COUNT(*) FROM clinic_daily_stats WHERE visit_count <= 0` must return 0.
- [x] **Test 4: Revenue totals match** — `SELECT SUM(total_revenue) FROM clinic_daily_stats WHERE clinic_id = X` must equal `SELECT COALESCE(SUM(total_amount), 0) FROM prescriptions_header WHERE clinic_id = X` for every clinic.

## Notes
- This migration is **idempotent** — running it multiple times produces the same result because it TRUNCATEs first.
- The `ON CONFLICT` clause is a safety net; after TRUNCATE there should be no conflicts, but it prevents errors if the migration is partially re-run.
- This must run AFTER Phase 01 so the trigger is already fixed. Otherwise, any new prescriptions created between the backfill and the trigger fix would re-introduce drift.

---
**Next Phase:** [Phase 03: End-to-End Verification](./phase-03-verification.md)

