# Phase 02: Transactional Logic & Precision
Status: ✅ Completed
Dependencies: [Phase 01](./phase-01-database-schema.md)

## Objective
Fix financial precision issues and eliminate race conditions in stock management.

## Requirements
### Functional
- [x] Precision: Use `NUMERIC(12,2)` for all currency fields.
- [x] Atomicity: Ensure stock updates are thread-safe and prevent negative inventory.

### Non-Functional
- [x] Performance: Use `FOR NO KEY UPDATE` to minimize locking contention while maintaining integrity.
- [x] Safety: Implement database-level constraints as a final line of defense.

## Implementation Steps
1. [x] **Precision & Safety Fix**: 
    - [x] Migration to change `medicines.price`, `prescriptions_header.total_amount`, and `prescription_details.unit_price` to `NUMERIC(12,2)`.
    - [x] Add `CHECK (stock_quantity >= 0)` constraint to `medicines` table.
2. [x] **Atomic Updates**:
    - [x] Update `update_prescription` RPC.
    - [x] Implement `SELECT ... FOR NO KEY UPDATE` on medicines being modified.
    - [x] Ensure all price calculations within the RPC use `NUMERIC` casting (e.g., `(v_item->>'unit_price')::NUMERIC`).
    - [x] Process "old stock return" and "new stock deduction" within the same transaction block.
3. [x] **Data Validation**: Ensure the RPC returns descriptive errors if stock is insufficient.

## Files to Create/Modify
- `supabase/migrations/[TIMESTAMP]_fix_precision_and_atomicity.sql`

## Test Criteria
- [x] Multi-user test: Parallel updates to the same medicine don't result in "Lost Updates".
- [x] Negative stock test: Attempting to deduct more than available results in a `CHECK constraint violation`.
- [x] Precision test: Financial sums match exactly (no floating point drift).

---
Next Phase: [Phase 03: Backend Action Optimization](./phase-03-backend-optimization.md)
