Created At: 2026-08-07T02:16:15Z
Completed At: 2026-08-07T09:17:30Z
File Path: `file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/20260807-decimal-price-input/phase-01-validation-schema.md`

# Phase 01: Validation Schema & Decimal Normalization

Status: ✅ Completed
Dependencies: None

## Objective
Update the medicine form validation schema in `src/lib/validations/medicine.ts` to accept decimal prices provided as numbers or strings with comma `,` decimal separators (e.g. `4,7` or `4.7`), normalizing them to a valid positive number.

## Requirements
### Functional
- [x] Accept integer numbers (e.g., `5000`).
- [x] Accept decimal numbers with dot separator (e.g., `4.7`).
- [x] Accept decimal values input as string with comma separator (e.g., `"4,7"` -> `4.7`).
- [x] Reject negative values with error message `"Giá phải >= 0"`.
- [x] Reject non-numeric input strings with appropriate validation error.

### Non-Functional
- [x] Ensure full backwards compatibility with existing numeric inputs.
- [x] Keep Zod error messages localized in Vietnamese.

## Implementation Steps
1. Modify `medicineFormSchema` in `src/lib/validations/medicine.ts`.
2. Use `z.preprocess` or custom Zod transformation to convert comma decimal strings (`"4,7"`) into numeric floats (`4.7`).
3. Create file-based test `tests/phase-01-decimal-price-validation.test.ts` to verify parsing logic.

## Files to Create/Modify
- `src/lib/validations/medicine.ts` - Add decimal preprocessing and normalization to `medicineFormSchema`.
- `tests/phase-01-decimal-price-validation.test.ts` - Unit test suite for validation logic.

## Test Criteria
Execute unit tests using Vitest:
`npx vitest run tests/phase-01-decimal-price-validation.test.ts`

- [x] Test 1: Valid integer `5` passes validation.
- [x] Test 2: Valid float `4.7` passes validation.
- [x] Test 3: String `"4,7"` is normalized to `4.7` and passes validation.
- [x] Test 4: Negative price `-10` fails validation.
- [x] Test 5: Invalid string `"abc"` fails validation.

---
Next Phase: [Phase 02: UI Component Update](./phase-02-ui-component-update.md)
