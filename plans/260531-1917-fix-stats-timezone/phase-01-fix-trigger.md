# Phase 01: Fix Trigger Function
**Status:** ✅ Completed  
**Dependencies:** None

## Objective
Rewrite the `fn_sync_clinic_daily_stats()` trigger function to fix all three logic bugs: timezone-unsafe date casting, silent update failure on UPDATE events, and trailing empty rows on DELETE events.

## Bugs Addressed
1. **Timezone mismatch:** Replace all `prescription_date::DATE` with `(prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE`.
2. **Silent update failure:** Replace plain `UPDATE` on UPDATE events with `INSERT ... ON CONFLICT DO UPDATE` (UPSERT) to handle missing rollup rows.
3. **Trailing empty rows:** Add `DELETE` cleanup after decrementing `visit_count` to remove rows where `visit_count <= 0`.

## Implementation Steps

### 1. Create new migration file
- [x] Create `supabase/migrations/20260531_fix_stats_trigger_timezone.sql`

### 2. Fix INSERT handler
- [x] Replace:
  ```sql
  v_date := NEW.prescription_date::DATE;
  ```
  With:
  ```sql
  v_date := (NEW.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
  ```

### 3. Fix UPDATE handler
- [x] Replace plain `UPDATE` for same-day revenue adjustment with UPSERT:
  ```sql
  INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
  VALUES (NEW.clinic_id, v_new_date, 0, NEW.total_amount - OLD.total_amount)
  ON CONFLICT (clinic_id, date) DO UPDATE
  SET total_revenue = clinic_daily_stats.total_revenue - OLD.total_amount + NEW.total_amount;
  ```
- [x] Use timezone-aware date casting for both OLD and NEW dates in cross-day UPDATE logic.

### 4. Fix DELETE handler
- [x] After decrementing visit_count and total_revenue, add cleanup:
  ```sql
  DELETE FROM public.clinic_daily_stats
  WHERE clinic_id = OLD.clinic_id
    AND date = v_date
    AND visit_count <= 0;
  ```

### 5. Apply same cleanup to UPDATE handler (old date side)
- [x] When an UPDATE changes the date (cross-day), also clean up the old date's row if visit_count drops to 0.

### 6. Grant and re-attach trigger
- [x] Drop and recreate the trigger on `prescriptions_header`.

## Files to Create/Modify
- `supabase/migrations/20260531_fix_stats_trigger_timezone.sql` — New migration with the fixed trigger function

## Complete Migration SQL
```sql
-- Phase 01: Fix timezone bug, silent update failure, and trailing empty rows
-- in fn_sync_clinic_daily_stats() trigger function.

CREATE OR REPLACE FUNCTION public.fn_sync_clinic_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_old_date DATE;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_date := (NEW.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
        VALUES (NEW.clinic_id, v_date, 1, NEW.total_amount)
        ON CONFLICT (clinic_id, date) DO UPDATE
        SET visit_count = clinic_daily_stats.visit_count + 1,
            total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;

        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_date := (OLD.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
        v_date := (NEW.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        IF (v_old_date <> v_date OR OLD.clinic_id <> NEW.clinic_id) THEN
            -- Decrement old date
            UPDATE public.clinic_daily_stats
            SET visit_count = visit_count - 1,
                total_revenue = total_revenue - OLD.total_amount
            WHERE clinic_id = OLD.clinic_id AND date = v_old_date;

            -- Cleanup old date if empty
            DELETE FROM public.clinic_daily_stats
            WHERE clinic_id = OLD.clinic_id AND date = v_old_date AND visit_count <= 0;

            -- Increment new date (UPSERT)
            INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
            VALUES (NEW.clinic_id, v_date, 1, NEW.total_amount)
            ON CONFLICT (clinic_id, date) DO UPDATE
            SET visit_count = clinic_daily_stats.visit_count + 1,
                total_revenue = clinic_daily_stats.total_revenue + EXCLUDED.total_revenue;
        ELSE
            -- Same day, same clinic: only adjust revenue (UPSERT for safety)
            INSERT INTO public.clinic_daily_stats (clinic_id, date, visit_count, total_revenue)
            VALUES (NEW.clinic_id, v_date, 0, NEW.total_amount - OLD.total_amount)
            ON CONFLICT (clinic_id, date) DO UPDATE
            SET total_revenue = clinic_daily_stats.total_revenue - OLD.total_amount + NEW.total_amount;
        END IF;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        v_date := (OLD.prescription_date AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

        UPDATE public.clinic_daily_stats
        SET visit_count = visit_count - 1,
            total_revenue = total_revenue - OLD.total_amount
        WHERE clinic_id = OLD.clinic_id AND date = v_date;

        -- Cleanup: remove row if no visits left
        DELETE FROM public.clinic_daily_stats
        WHERE clinic_id = OLD.clinic_id AND date = v_date AND visit_count <= 0;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Re-attach trigger
DROP TRIGGER IF EXISTS trg_sync_clinic_daily_stats ON public.prescriptions_header;
CREATE TRIGGER trg_sync_clinic_daily_stats
AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions_header
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_clinic_daily_stats();
```

## Test Criteria — File: `src/test/stats-timezone-fix.test.ts`
This test file validates the trigger logic by mocking the SQL behavior:

- [x] **Test 1: Timezone-aware date extraction** — Given a `prescription_date` of `2026-06-01T01:30:00+07:00` (which is `2026-05-31T18:30:00Z`), verify that the trigger assigns it to date `2026-06-01` (VN timezone), NOT `2026-05-31` (UTC).
- [x] **Test 2: INSERT creates rollup row** — After inserting a prescription, verify `clinic_daily_stats` has a row with `visit_count = 1` for the correct VN date.
- [x] **Test 3: DELETE removes rollup row when last visit** — After deleting the only prescription for a given day, verify the rollup row is deleted (not left with `visit_count = 0`).
- [x] **Test 4: UPDATE same-day adjusts revenue only** — When updating `total_amount` without changing `prescription_date`, verify `visit_count` remains unchanged and `total_revenue` reflects the difference.
- [x] **Test 5: UPDATE cross-day moves visit correctly** — When changing `prescription_date` to a different VN-date, verify old date decrements and new date increments, both using VN timezone.
- [x] **Test 6: UPDATE with missing rollup row uses UPSERT** — When the rollup row for the target date doesn't exist, verify the UPDATE handler creates it via UPSERT instead of silently failing.

## Notes
- The migration uses `CREATE OR REPLACE FUNCTION` so it will overwrite the existing trigger function in-place.
- The trigger is dropped and recreated to ensure it's bound to the latest function version.
- No changes to RLS policies are needed — the existing policies on `clinic_daily_stats` remain valid.

---
**Next Phase:** [Phase 02: Backfill & Recalculate Data](./phase-02-backfill-data.md)
