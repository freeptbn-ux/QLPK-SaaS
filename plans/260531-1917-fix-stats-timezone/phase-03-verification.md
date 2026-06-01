# Phase 03: End-to-End Verification
**Status:** ✅ Completed  
**Dependencies:** Phase 01, Phase 02

## Objective
Verify end-to-end that the fix is working correctly: the Dashboard shows accurate numbers, the trigger handles edge cases properly on production, and no data drift remains.

## Implementation Steps

### 1. Run database integrity checks
- [x] Execute SQL queries directly on production to confirm rollup totals match prescription counts for all clinics.

### 2. Verify Dashboard display
- [x] Load the `/statistics` page and confirm "Lượt khám tháng này" matches the actual prescription count for May 2026 (should be 61, not 63).

### 3. Test trigger with edge-case prescription
- [x] Create a test prescription at a timezone-boundary time (e.g., `2026-06-01 00:30:00+07` which is `2026-05-31 17:30:00Z`) and verify it is attributed to June 1st in the rollup, not May 31st.

### 4. Test delete cleanup
- [x] Delete the test prescription created in step 3 and verify the rollup row is removed (not left with `visit_count = 0`).

### 5. Create end-to-end test file
- [x] Write `src/test/stats-e2e-integrity.test.ts` to codify all the above checks as automated tests.

## Files to Create/Modify
- `src/test/stats-e2e-integrity.test.ts` — New test file

## Test Criteria — File: `src/test/stats-e2e-integrity.test.ts`
This test file performs a full integration check of the fixed system:

- [x] **Test 1: Monthly visit count matches for current month** — Call `getOverviewStats()` (mocked with correct Supabase data) and assert `monthlyVisits` equals the actual `COUNT(*)` from `prescriptions_header` for the same month and clinic, using VN timezone boundaries.
- [x] **Test 2: Timezone boundary — late-night VN prescription** — Simulate a prescription created at `2026-06-01T01:00:00+07:00`. The trigger should assign it to `2026-06-01` in the rollup. Querying stats for June should include this visit; querying May should not.
- [x] **Test 3: Timezone boundary — late-night UTC prescription** — Simulate a prescription created at `2026-05-31T23:30:00+07:00` (= `2026-05-31T16:30:00Z`). The trigger should assign it to `2026-05-31` in both UTC and VN timezone. No drift expected.
- [x] **Test 4: Delete last visit removes rollup row** — Insert a prescription for a new date with no other visits, then delete it. Assert that `clinic_daily_stats` has no row for that date (not a row with `visit_count = 0`).
- [x] **Test 5: No global data drift** — For every clinic, assert: `SUM(visit_count) FROM clinic_daily_stats` equals `COUNT(*) FROM prescriptions_header` (using VN timezone date boundaries for monthly filtering).

## Verification SQL Queries (to run manually after deployment)

### Query 1: Global drift check
```sql
SELECT
    p.clinic_id,
    p.actual_count,
    r.rollup_count,
    p.actual_count - r.rollup_count AS drift
FROM (
    SELECT clinic_id, COUNT(*) AS actual_count
    FROM public.prescriptions_header
    GROUP BY clinic_id
) p
LEFT JOIN (
    SELECT clinic_id, SUM(visit_count) AS rollup_count
    FROM public.clinic_daily_stats
    GROUP BY clinic_id
) r ON p.clinic_id = r.clinic_id;
```
**Expected:** `drift = 0` for all clinics.

### Query 2: May 2026 specific check
```sql
SELECT
    (SELECT COUNT(*) FROM public.prescriptions_header
     WHERE (prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE >= '2026-05-01'
       AND (prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE <= '2026-05-31') AS actual_may_visits,
    (SELECT SUM(visit_count) FROM public.clinic_daily_stats
     WHERE date >= '2026-05-01' AND date <= '2026-05-31') AS rollup_may_visits;
```
**Expected:** Both values are equal (should be 61).

### Query 3: No garbage rows
```sql
SELECT COUNT(*) AS garbage_rows
FROM public.clinic_daily_stats
WHERE visit_count <= 0;
```
**Expected:** `0`.

## Notes
- The manual verification queries should be run via Supabase SQL Editor immediately after deploying Phase 01 + 02 migrations.
- The test file uses mocked Supabase clients to simulate the trigger behavior at the application layer.
- After this phase, monitor the Dashboard for 1-2 days to ensure no new drift appears.

---
**Plan complete.** All three phases cover the full fix lifecycle: code fix → data repair → verification.
