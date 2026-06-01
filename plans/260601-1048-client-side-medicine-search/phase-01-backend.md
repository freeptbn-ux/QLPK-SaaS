# Phase 01: Setup Backend Server Action
Status: ✅ Completed
Dependencies: None

## Objective
Implement a secure, high-performance Server Action to fetch the entire active list of medicines for the current clinic at once, so the client can search and filter them locally.

## Requirements
### Functional
- [x] Add a new server action `getMedicinesForSearch()` in `src/actions/medicines.ts`.
- [x] The action must verify authentication and obtain the current user's `clinicId`.
- [x] It must query only active medicines belonging to that `clinicId`.
- [x] It must select only required fields for optimization: `id, name, packing_spec, price, stock_quantity, min_stock_level`.
- [x] Order the medicines alphabetically by `name`.
- [x] Limit the query to a generous upper bound (e.g., 1000 items) to prevent memory issues while ensuring all active clinic medicines are returned.

### Non-Functional
- [x] Security: Verify row-level tenancy (`clinic_id`) and protect against unauthorized or cross-tenant data access.
- [x] Performance: Optimize SQL query selection fields to minimize payload size (should be under 50KB for typical clinics).

## Implementation Steps
1. [x] Create `getMedicinesForSearch` function in `src/actions/medicines.ts`.
2. [x] Add a backend unit test in `src/actions/__tests__/medicines_search.test.ts` (or add to existing tests) to verify the server action returns all clinic medicines correctly.

## Files to Create/Modify
- `src/actions/medicines.ts` - Add `getMedicinesForSearch` Server Action.
- `src/actions/__tests__/medicines_search.test.ts` - [Create] Add integration/unit tests for the new action.

## Test Criteria
- [x] Verification that `getMedicinesForSearch()` returns all matching medicines without any pagination or small limit.
- [x] Verification that `getMedicinesForSearch()` returns only medicines belonging to the authenticated clinic.
- [x] Running and passing backend tests successfully: `npx vitest run src/actions/__tests__/medicines_search.test.ts`

---
Next Phase: [Phase 02: Implement Client-Side Autocomplete](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260601-1048-client-side-medicine-search/phase-02-frontend.md)
