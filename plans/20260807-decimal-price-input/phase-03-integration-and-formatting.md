# Phase 03: Integration & Formatting Verification

Status: ✅ Completed
Dependencies: Phase 01, Phase 02

## Objective
Verify end-to-end integration across medicine listing display, prescription item calculations, and currency formatting to ensure decimal prices are rendered correctly and without regression.

## Requirements
### Functional
- [x] Ensure `Intl.NumberFormat('vi-VN')` formats decimal medicine prices properly (e.g., `4,7 VNĐ` or `4.700 VNĐ` depending on unit scale).
- [x] Verify prescription calculations `quantity * unit_price` compute correctly with decimal prices (e.g., 10 packages @ 4.7 = 47 VNĐ).
- [x] Ensure database models and server actions handle float/decimal data without truncation.

### Non-Functional
- [x] Zero regression on existing integer price medicine operations.

## Implementation Steps
1. Review medicine table views and prescription calculation rows (`MedicineList.tsx`, `PrescriptionItemRow.tsx`).
2. Create integration test file `tests/phase-03-decimal-price-integration.test.tsx` verifying price formatting and totals calculation with decimal prices.

## Files to Create/Modify
- `tests/phase-03-decimal-price-integration.test.tsx` - Integration test suite for decimal price calculations and UI display formatting.

## Test Criteria
Execute integration tests using Vitest:
`npx vitest run tests/phase-03-decimal-price-integration.test.tsx`

- [x] Test 1: Verify `PrescriptionItemRow` computes total accurately for quantity `10` and unit price `4.7`.
- [x] Test 2: Verify `MedicineList` renders decimal prices properly formatted for Vietnamese locale.

---
End of Plan
