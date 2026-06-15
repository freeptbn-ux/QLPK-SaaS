# Phase 02: Patient Creation Redirect
Status: ✅ Completed
Dependencies: [Phase 01](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260615-1905-patient-redirect-prescription-autosave/phase-01-setup.md)

## Objective
Upon successful patient creation, redirect the doctor directly to the newly created patient's details/info page (e.g., `/patients/[id]`).

## Requirements
### Functional
- When creating a patient via the "Thêm bệnh nhân mới" form dialog, retrieve the ID of the newly added patient from the `addPatient` action response.
- Use Next.js client-side router to navigate to `/patients/[id]`.
- Trigger parent refresh/success callback so the underlying list updates, and close the dialog.
- For patient edits, retain existing behavior (just toast, call `onSuccess()`, and close dialog).

## Implementation Steps
1. [x] Import `useRouter` from `next/navigation` in `src/components/features/patients/PatientFormDialog.tsx`.
2. [x] Add `const router = useRouter();` initialization in the component.
3. [x] Modify the `onSubmit` logic to check if `isEdit` is false (creation flow).
4. [x] In the creation flow, after successful `addPatient` call, retrieve the new patient `id` from `result.data.id`.
5. [x] Call `router.push(/patients/${newPatientId})`.
6. [x] Call `onSuccess()` and `onClose()` to clean up states.

## Files to Create/Modify
- [MODIFY] [PatientFormDialog.tsx](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/src/components/features/patients/PatientFormDialog.tsx)

## Test Criteria
### File-Based Tests
- Create a test file `src/components/features/patients/__tests__/PatientFormRedirect.test.tsx` containing tests:
  - Mock `useRouter` and its `push` function.
  - Render `PatientFormDialog` in add/create mode.
  - Fill out form fields and submit.
  - Assert that `addPatient` is called.
  - Assert that `router.push` is called with `/patients/<mock_id>` after successful creation.

---
Next Phase: [phase-03-prescription-guard.md](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260615-1905-patient-redirect-prescription-autosave/phase-03-prescription-guard.md)
