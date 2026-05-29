# Final Handoff Verification - `/medicines` Low Stock RPC

## Changed Files
- [x] Migration Supabase mới: `supabase/migrations/20260519195600_fix_low_stock_rpc_clinic_param.sql`
- [x] Server Action sửa đổi: `src/actions/medicines.ts`
- [x] Unit Test mới: `tests/verify-medicines-action-low-stock.test.ts`
- [x] Regression Test mới: `tests/verify-medicines-page-regression.test.tsx`
- [x] Hướng dẫn thủ công / SQL Verification: `tests/verify-low-stock-rpc.sql`
- [x] Báo cáo lỗi cập nhật: `1.md`

## Commands / Checks Run
- [x] Vitest action unit tests (3/3 passed)
- [x] Vitest page regression tests (3/3 passed)
- [x] SQL verification via MCP Supabase (Function signature, body membership checks, strict routine privileges verified)
- [x] Next.js dev server status & error diagnostics query (0 errors)

## Expected Final State
- [x] `/medicines` page loads successfully without compilation errors.
- [x] No `P0001 Not authenticated or clinic_id missing` error in server logs.
- [x] Low-stock medicines are strictly scoped to the user's clinic using profiles query validation.
- [x] Inactive medicines (`is_active = false`) are excluded from low-stock results.
- [x] Unauthorized clinic parameter calls are rejected immediately at database level.

## Reviewer / Deployment Notes
- Apply the Supabase SQL migration *first* in staging/production environments to ensure the new overloaded signature `get_low_stock_medicines(bigint)` exists before deploying the updated Server Action code.
- Confirm with a real user account that previously experienced the issue.
