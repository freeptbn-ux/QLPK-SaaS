# Phase 02: Prescription Form History Modal Integration

**Status:** ✅ Completed  
**Dependencies:** Phase 01  

---

## 1. Objective

Provide clinicians with quick, non-disruptive access to a patient's historical medication usage directly within the prescription authoring workflow (`PrescriptionForm`), enabling immediate reference to frequently used medications without leaving or losing form state.

---

## 2. Scope

- **In Scope:**
  - Add a dedicated trigger button labeled "Lịch sử dùng thuốc" positioned alongside the existing "Tính liều nhanh" trigger button in `src/components/features/prescriptions/PrescriptionForm.tsx`.
  - Wire the button state to display the existing `MedicineUsageDialog` component, passing the active `patient.id` and `patient.name`.
  - Ensure the dialog can be opened and dismissed seamlessly without resetting or clearing active prescription items, diagnosis, notes, or patient metrics.
  - Create a comprehensive file-based test checking modal rendering, open/close interactions, and state persistence in `PrescriptionForm`.

- **Out of Scope:**
  - Modifying the internal logic, sorting algorithm, or debounce search implementation of `MedicineUsageDialog.tsx`.
  - Modifying the underlying database RPC `get_medicine_usage_by_patient`.
  - Automatic addition of medicines from dialog to prescription items (Option C / Phase 2 backlog).

---

## 3. Requirements

### Functional Requirements
- `PrescriptionForm` must render a button labeled "Lịch sử dùng thuốc" in the medicine selection header area.
- Clicking the "Lịch sử dùng thuốc" button must open the `MedicineUsageDialog` for the current patient.
- Closing the dialog (via close button, backdrop click, or ESC key) must return focus and maintain existing draft form data (diagnosis, notes, entered prescription items).
- The button styling must be consistent with the surrounding UI action buttons (e.g., secondary pill action styled harmoniously with the "Tính liều nhanh" button).

### Non-Functional Requirements (Usability & Accessibility)
- The button must have clear visual indicators and accessible naming (e.g., icon + text).
- Opening and closing the dialog must not cause unwanted form submissions or page reloads.

---

## 4. Constraints

- Must reuse the existing `MedicineUsageDialog` from `@/components/features/patients/MedicineUsageDialog`.
- Must not cause regressions in existing prescription form tests (`src/components/features/prescriptions/__tests__/PrescriptionForm.test.tsx`).

---

## 5. Dependencies

- `MedicineUsageDialog` (`src/components/features/patients/MedicineUsageDialog.tsx`)
- `PrescriptionForm` (`src/components/features/prescriptions/PrescriptionForm.tsx`)
- Icons from `react-icons/hi2` (e.g., `HiOutlineClipboardDocumentList` or `HiOutlineClock`)

---

## 6. Acceptance Criteria

1. The "Lịch sử dùng thuốc" button is visible above the medicine search field in `PrescriptionForm`.
2. Clicking the button mounts/opens `MedicineUsageDialog` with the correct `patientId` and `patientName` props.
3. Form values remain intact when opening and closing the dialog.
4. The comprehensive file-based test passes in Vitest.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/prescription-history-button.test.tsx`  
**Purpose:** Verify that `PrescriptionForm` renders the history trigger button, toggles the `MedicineUsageDialog` with correct props, and preserves form inputs across dialog interactions.

```tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrescriptionForm from '@/components/features/prescriptions/PrescriptionForm';
import { Patient } from '@/types/database';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock MedicineUsageDialog to assert props and open state
vi.mock('@/components/features/patients/MedicineUsageDialog', () => ({
  default: vi.fn(({ open, onClose, patientId, patientName }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-medicine-usage-dialog">
        <span>Patient ID: {patientId}</span>
        <span>Patient Name: {patientName}</span>
        <button type="button" onClick={onClose} data-testid="close-history-dialog">
          Close Dialog
        </button>
      </div>
    );
  }),
}));

// Mock actions and helpers
vi.mock('@/actions/prescriptions', () => ({
  createPrescription: vi.fn(),
}));

vi.mock('@/actions/patients', () => ({
  getMedicineUsageByPatient: vi.fn().mockResolvedValue([]),
}));

const mockPatient: Patient = {
  id: 42,
  name: 'Nguyen Van A',
  dob: '1990-01-01',
  gender: 'male',
  phone: '0901234567',
  address: '123 Test Street',
  weight: 65,
  clinic_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('Phase 02 Test: Prescription Form History Modal Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Lịch sử dùng thuốc" button and toggles the dialog without altering form state', async () => {
    render(
      <PrescriptionForm
        patient={mockPatient}
        consultationFee={50000}
        presets={[]}
      />
    );

    // Verify history trigger button is present
    const historyButton = screen.getByRole('button', { name: /lịch sử dùng thuốc/i });
    expect(historyButton).toBeDefined();

    // Dialog should initially be closed
    expect(screen.queryByTestId('mock-medicine-usage-dialog')).toBeNull();

    // Enter a diagnosis into the form
    const diagnosisInput = screen.getByPlaceholderText(/nhập chẩn đoán/i) as HTMLInputElement;
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng cấp' } });
    expect(diagnosisInput.value).toBe('Viêm họng cấp');

    // Click history button to open dialog
    fireEvent.click(historyButton);

    // Verify dialog opened with matching patient props
    const dialog = screen.getByTestId('mock-medicine-usage-dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByText('Patient ID: 42')).toBeDefined();
    expect(screen.getByText('Patient Name: Nguyen Van A')).toBeDefined();

    // Close dialog
    const closeBtn = screen.getByTestId('close-history-dialog');
    fireEvent.click(closeBtn);

    // Dialog closed, diagnosis input retains its value
    expect(screen.queryByTestId('mock-medicine-usage-dialog')).toBeNull();
    expect(diagnosisInput.value).toBe('Viêm họng cấp');
  });
});
```

