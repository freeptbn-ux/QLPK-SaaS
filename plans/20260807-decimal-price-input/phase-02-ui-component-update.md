# Phase 02: UI Component Update (`MedicineFormDialog`)

Status: ✅ Completed
Dependencies: Phase 01

## Objective
Update `MedicineFormDialog.tsx` to add `step="any"` attribute to the price input element to fix HTML5 constraint validation, and handle input events to seamlessly accept comma `,` input for decimal prices.

## Requirements
### Functional
- [x] Add `step="any"` to the `<input>` element for `price` in `MedicineFormDialog.tsx`.
- [x] Prevent HTML5 validation popup ("Vui lòng chọn một giá trị hợp lệ. Hai giá trị hợp lệ gần nhất là 4 và 5.") when typing decimal numbers like `4.7` or `4,7`.
- [x] Ensure form submit handles decimal price inputs correctly and passes normalized numbers to `addMedicine` or `updateMedicine`.

### Non-Functional
- [x] Maintain dark mode and existing Tailwind styling.
- [x] Ensure smooth keyboard input UX without layout shifts.

## Implementation Steps
1. Edit `src/components/features/medicines/MedicineFormDialog.tsx`:
   - Add `step="any"` to the price `<input>`.
   - Update input registration / event handling so comma input is accepted and parsed without returning `NaN`.
2. Create component test file `tests/phase-02-medicine-form-dialog.test.tsx` to render the dialog and simulate entering decimal prices.

## Files to Create/Modify
- `src/components/features/medicines/MedicineFormDialog.tsx` - Update price input props and form handling.
- `tests/phase-02-medicine-form-dialog.test.tsx` - React Testing Library test suite for dialog component.

## Test Criteria
Execute component tests using Vitest:
`npx vitest run tests/phase-02-medicine-form-dialog.test.tsx`

- [x] Test 1: Render `MedicineFormDialog` and verify `<input>` has `step="any"`.
- [x] Test 2: Input `4.7` into price input and submit form successfully.
- [x] Test 3: Input `4,7` into price input and submit form successfully with price value `4.7`.

---
Next Phase: [Phase 03: Integration and Formatting](./phase-03-integration-and-formatting.md)
