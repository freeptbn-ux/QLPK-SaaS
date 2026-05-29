# Phase 04: UI/UX & Error Handling
Status: ⬜ Pending
Dependencies: [Phase 03](./phase-03-backend-optimization.md)

## Objective
Improve user feedback and error handling on the frontend to match the hardened backend logic.

## Requirements
### Functional
- [ ] Clear error messages when a medicine name is duplicated within the same clinic.
- [ ] Loading states for inventory updates.

### Non-Functional
- [ ] UX: Ensure the user understands why an action failed (e.g., "Medicine name already exists in your clinic").

## Implementation Steps
1. [ ] **Update Medicine Form**: Add validation and error display for name collisions.
2. [ ] **Handle Stock Errors**: Display specific messages if a stock update fails due to a race condition or insufficient stock (using the new DB constraints).
3. [ ] **Refine List View**: Ensure low-stock warnings are displayed accurately based on the optimized server-side data.

## Files to Create/Modify
- `src/components/medicines/MedicineForm.tsx` (or equivalent)
- `src/app/medicines/page.tsx`

## Test Criteria
- [ ] Try to create a medicine with an existing name -> Observe error message.
- [ ] Verify loading spinners during data mutations.

---
Next Phase: [Phase 05: Verification & Security Audit](./phase-05-verification.md)
