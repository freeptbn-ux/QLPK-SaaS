# Phase 03: Backend Action Optimization
Status: ✅ Completed
Dependencies: [Phase 02](./phase-02-transactional-precision.md)

## Objective
Optimize data fetching and filtering to reduce network load and prevent client-side performance bottlenecks.

## Requirements
### Functional
- [ ] Server-side filtering for low-stock medicines.
- [ ] Explicit `clinic_id` context for all medicine-related queries.

### Non-Functional
- [ ] Performance: Reduce memory usage on the client by fetching only necessary data.
- [ ] Security: Enforce tenant isolation in application code (Server Actions).

## Implementation Steps
1. [ ] **Create `get_low_stock_medicines` RPC**:
    - [ ] Define a new Supabase RPC that filters medicines where `stock_quantity <= min_stock_level` and `clinic_id = get_my_clinic_id()`.
2. [ ] **Refactor `getLowStockMedicines` Action**:
    - [ ] Update `src/actions/medicines.ts` to call the new RPC.
    - [ ] Remove the dangerous client-side `.filter()` fallback.
3. [ ] **Harden `isMedicineInUse`**:
    - [ ] Ensure the check only queries prescriptions within the current clinic's context.
4. [ ] **Standardize Context**: 
    - [ ] Ensure all functions in `src/actions/medicines.ts` explicitly retrieve `clinic_id` from the user's session and use it in all `.eq('clinic_id', ...)` filters.
5. [ ] **RPC Cleanup**: Revoke `anon` access to the newly created RPC.

## Files to Create/Modify
- `supabase/migrations/[TIMESTAMP]_add_medicine_rpcs.sql`
- `src/actions/medicines.ts`

## Test Criteria
- [ ] Low-stock medicine list is accurate and tenant-isolated.
- [ ] No "fetch all" calls observed in network logs during low-stock check.
- [ ] Permission check: Attempting to check a medicine ID belonging to another clinic returns `false` or an error.

---
Next Phase: [Phase 04: UI/UX & Error Handling](./phase-04-ui-ux.md)
