# Plan: Fix Statistics Rollup Timezone & Data Integrity Bugs

## Summary
Fix three logic bugs in the `clinic_daily_stats` rollup trigger system that cause visit count drift between the rollup table and actual prescription data. The root cause is timezone-unsafe date casting in the Postgres trigger function `fn_sync_clinic_daily_stats()`.

## Problem Statement
- **Expected:** "Lượt khám tháng này" should show **61** (actual prescription count for May 2026).
- **Actual:** Dashboard shows **63** — a +2 phantom visit drift.
- **Root cause:** The trigger uses `prescription_date::DATE` which casts under the session's timezone (often UTC on Supabase Cloud), while the frontend queries use Vietnam timezone (`Asia/Ho_Chi_Minh`). This mismatch causes INSERT and DELETE operations to target different dates in the rollup table, leaving orphaned rows.

## Bugs to Fix
| # | Bug | Severity | Impact |
|---|-----|----------|--------|
| 1 | **Timezone mismatch** in trigger: `::DATE` cast uses session TZ (UTC) instead of `Asia/Ho_Chi_Minh` | 🔴 Critical | Phantom visits, wrong month attribution |
| 2 | **Silent update failure** on UPDATE events: if rollup row doesn't exist, `UPDATE` silently affects 0 rows | 🟡 Medium | Lost data after manual DB interventions |
| 3 | **Trailing empty rows** on DELETE: rows with `visit_count=0` are never cleaned up | 🟢 Low | Garbage accumulation over time |

## Phases

| # | Phase | File | Status | Tasks |
|---|-------|------|--------|-------|
| 01 | Fix Trigger Function | [phase-01-fix-trigger.md](./phase-01-fix-trigger.md) | ✅ Completed | 6 |
| 02 | Backfill & Recalculate Data | [phase-02-backfill-data.md](./phase-02-backfill-data.md) | ✅ Completed | 4 |
| 03 | End-to-End Verification | [phase-03-verification.md](./phase-03-verification.md) | ✅ Completed | 5 |

**Total:** 15 tasks | Estimated: 1 session

## Files Affected
- `supabase/migrations/<new>_fix_stats_trigger_timezone.sql` — New migration
- `supabase/migrations/<new>_backfill_stats_rollup.sql` — New migration
- `src/test/stats-timezone-fix.test.ts` — New test file
- `src/test/stats-backfill-verify.test.ts` — New test file
- `src/test/stats-e2e-integrity.test.ts` — New test file
