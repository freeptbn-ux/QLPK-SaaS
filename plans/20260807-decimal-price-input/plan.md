# Plan: Decimal Price Input Support

Created: 2026-08-07
Status: ✅ Completed

## Overview
Enable users to enter decimal prices (e.g. `4,7` or `4.7`) in the "Sửa thông tin thuốc" (Edit Medicine Info) modal and across medicine forms. Solve the browser HTML5 input validation constraint (`step="1"`) and support comma `,` as a decimal separator for Vietnamese locale input.

## Tech Stack
- Frontend: Next.js 16, React 19, React Hook Form, Zod
- Testing: Vitest, React Testing Library

## Phases

| Phase | Name | Status | Test File |
|-------|------|--------|-----------|
| 01 | Validation Schema & Decimal Normalization | ✅ Completed | `tests/phase-01-decimal-price-validation.test.ts` |
| 02 | UI Component Update (`MedicineFormDialog`) | ✅ Completed | `tests/phase-02-medicine-form-dialog.test.tsx` |
| 03 | Integration & Formatting Verification | ✅ Completed | `tests/phase-03-decimal-price-integration.test.tsx` |

## Quick Commands
- Run Phase 1 Tests: `npx vitest run tests/phase-01-decimal-price-validation.test.ts`
- Run Phase 2 Tests: `npx vitest run tests/phase-02-medicine-form-dialog.test.tsx`
- Run Phase 3 Tests: `npx vitest run tests/phase-03-decimal-price-integration.test.tsx`
- Run All Tests: `npm run test`
