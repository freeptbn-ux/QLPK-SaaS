# Phase 03: Prescription Form Navigation Guard
Status: ✅ Completed
Dependencies: [Phase 02](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260615-1905-patient-redirect-prescription-autosave/phase-02-patient-redirect.md)

## Objective
Implement a navigation guard in the prescription page (`/patients/[id]/prescribe`) that intercepts browser unload/reload and client-side transitions when the prescription form is dirty (i.e. has unsaved inputs), prompting a custom modal with options: "Lưu đơn" (Green button), "Không lưu đơn" (Red button), or "Hủy" (Gray button).

## Requirements
### Functional
- **Form Dirty State**: Determine if the form is dirty: `isDirty` is true if `diagnosis` is non-empty, OR `items.length > 0`, OR `notes` is non-empty.
- **Unload Guard**: Implement standard `beforeunload` listener to prompt browser exit/refresh warnings.
- **Client-Side Link Click Guard**: Listen for global anchor tag `click` events to intercept client-side router transitions.
- **Page Back Button Guard**: Intercept "Quay lại" button clicks inside the form to trigger the modal if form is dirty.
- **Browser History Back/Forward Guard (Popstate)**: Intercept back navigation events, pushing current state back and opening the guard modal.
- **Custom Confirmation Dialog**:
  - A premium styled modal dialog conforming to the visual standards of the application, showing options:
    - **Lưu đơn** (Green button: e.g. `bg-emerald-600 hover:bg-emerald-700`): Performs form validation. If valid, submits the prescription and then redirects to the target page. If invalid, displays validation errors and keeps the user on the page.
    - **Không lưu đơn** (Red button: e.g. `bg-red-600 hover:bg-red-700`): Discards the draft and proceeds directly to the target page.
    - **Hủy** (Gray button: e.g. `border border-slate-200 hover:bg-slate-50`): Closes the dialog and stays on the page.
- **UI/UX Optimization**: Keep visual layout clean, clear headers, micro-animations using Framer Motion, and intuitive user options.

## Implementation Steps
1. [x] Define `isDirty` using a `useMemo` in `src/components/features/prescriptions/PrescriptionForm.tsx` that tracks `diagnosis`, `items`, and `notes`.
2. [x] Set up `beforeunload` event handler inside a `useEffect` hooked to `isDirty`.
3. [x] Add state variables for `confirmSaveOpen` (boolean) and `pendingNavigationUrl` (string | null).
4. [x] Create a custom confirm modal inside `PrescriptionForm.tsx` (using Framer Motion for modal transitions) matching the project style.
5. [x] Implement click listener for standard `<a>` tags during the capture phase to intercept client-side transitions.
6. [x] Implement a custom `popstate` listener to block browser back/forward buttons when the form is dirty, pushing state back and displaying the modal.
7. [x] Modify the "Quay lại" button click handler to prompt this dialog if dirty.
8. [x] Implement the modal button actions:
   - "Lưu đơn" (Validation -> `handleSubmit` or equivalent submit helper -> navigate).
   - "Không lưu đơn" (navigate without saving, bypass `isDirty`).
   - "Hủy" (close dialog, do nothing).

## Files to Create/Modify
- [MODIFY] [PrescriptionForm.tsx](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/src/components/features/prescriptions/PrescriptionForm.tsx)

## Test Criteria
### File-Based Tests
- Create a test file `src/components/features/prescriptions/__tests__/PrescriptionFormGuard.test.tsx` containing tests:
  - Render `PrescriptionForm` with a mock patient.
  - Fill the form (make it dirty) and simulate an anchor click or back button click.
  - Verify that the custom prompt modal appears.
  - Verify the presence of the three styled buttons: "Lưu đơn" (green style), "Không lưu đơn" (red style), "Hủy" (gray style).
  - Simulate clicking "Hủy" and assert that the dialog closes and navigation is canceled.
  - Simulate clicking "Không lưu đơn" and assert that `router.push` is called with the target URL without submitting the form.
  - Simulate clicking "Lưu đơn" and assert that form validation runs, `createPrescription` is called, and navigation succeeds.

---
Next Phase: [phase-04-verification.md](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260615-1905-patient-redirect-prescription-autosave/phase-04-verification.md)
