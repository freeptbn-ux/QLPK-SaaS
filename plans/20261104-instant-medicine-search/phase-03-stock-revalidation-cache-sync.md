# Phase 03: Prescription Integration, Stock Revalidation & Cache Invalidation

**Status:** ✅ Completed  
**Dependencies:** Phase 01, Phase 02  

---

## 1. Objective

Integrate the instant medicine autocomplete experience into `PrescriptionForm` and related prescribing workflows, ensuring that inventory stock adjustments and new medicine creations immediately invalidate and synchronize the client-side catalog cache without stale state anomalies.

---

## 2. Scope

- **In Scope:**
  - Verify and wire `PrescriptionForm` (`src/components/features/prescriptions/PrescriptionForm.tsx`) to utilize the new instant autocomplete component seamlessly.
  - Hook into medicine mutation operations (such as creating medicines, editing medicines, or manual stock adjustments in `src/actions/medicines.ts`) to automatically trigger cache invalidation.
  - Wire prescription submission so that successfully finalized prescriptions update or trigger a background refresh of remaining stock levels.
  - Ensure that `PrescriptionHistory` modal dialogs (`src/components/features/patients/PrescriptionHistory.tsx`) benefit from the same instant autocomplete experience without duplicate fetches.
  - Create a comprehensive file-based test suite verifying full end-to-end integration: catalog mounting, item selection, row population, prescription submission, and cache revalidation upon mutations.

- **Out of Scope:**
  - Redesigning the patient detail page or prescription printing layout.
  - Restructuring database triggers for stock deductions (already consolidated in prior performance updates).

---

## 3. Requirements

### Functional Requirements
- **Row Population:** Selecting an instant autocomplete suggestion must immediately append a prescription row with pre-filled name, unit, price, and default dosage fields.
- **Stock Integrity Check:** If a user selects an item that had stock at catalog fetch time but was depleted concurrently, the system must handle the stock validation error gracefully upon form submission.
- **Mutation Invalidation:** Adding a new medicine via the inventory page or adjusting stock levels must notify and clear the cached catalog, ensuring the newly created medicine appears immediately in search.
- **Prescription Creation Sync:** Upon successful prescription creation, the cached medicine stock quantities must reflect the consumed amounts or be revalidated in the background.

### Non-Functional Requirements
- **Consistency:** Form interactions and state management in `PrescriptionForm` must remain stable without causing unnecessary parent re-renders.
- **Zero Stale State:** Clinicians must never see ghost medicines or stale stock counts after making inventory modifications in the same browser session.

---

## 4. Constraints

- Must preserve existing prescription validation schemas (`zod` schemas for `CreatePrescriptionData`).
- Do not alter existing database transactions or trigger contracts.

---

## 5. Dependencies

- Phase 01 (`useMedicineCatalog`, `invalidateMedicineCatalog`)
- Phase 02 (`MedicineAutocomplete`)
- `src/components/features/prescriptions/PrescriptionForm.tsx`
- `src/actions/prescriptions.ts`
- Vitest and `@testing-library/react`

---

## 6. Acceptance Criteria

1. Selecting an item from the instant autocomplete adds a prescription item row with all defaults filled.
2. Invalidation hooks successfully trigger after medicine stock adjustment or creation actions.
3. Submitting a prescription completes smoothly and initiates catalog stock revalidation.
4. `PrescriptionHistory` modal functions identically using the shared instant catalog.
5. Exactly one comprehensive file-based test in `tests/phase-03-prescription-stock-sync.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-03-prescription-stock-sync.test.ts`  
**Purpose:** Verify end-to-end integration with PrescriptionForm, auto-population of medicine fields, cache invalidation after inventory updates, and post-prescription submission stock synchronization.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mocks
const mockCreatePrescription = vi.fn();
const mockInvalidateCatalog = vi.fn();

const sampleCatalog = [
  { id: 101, name: 'Paracetamol 500mg vỉ xanh', unit: 'Vỉ', price: 12000, stock_quantity: 50, min_stock_level: 5, is_active: true },
  { id: 102, name: 'Astemix siro', unit: 'Chai', price: 30000, stock_quantity: 20, min_stock_level: 2, is_active: true },
];

vi.mock('@/hooks/useMedicineCatalog', () => ({
  useMedicineCatalog: () => ({
    medicines: sampleCatalog,
    isLoading: false,
    error: null,
  }),
  invalidateMedicineCatalog: () => mockInvalidateCatalog(),
}));

vi.mock('@/actions/prescriptions', () => ({
  createPrescription: (...args: any[]) => mockCreatePrescription(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('Phase 03: Prescription Integration, Stock Revalidation & Cache Invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement: should select medicine from autocomplete and auto-populate prescription item', async () => {
    const { default: PrescriptionForm } = await import('@/components/features/prescriptions/PrescriptionForm');
    const patient = { id: 96, name: 'Nguyễn Kiều Anh', age: 3, weight: 12 } as any;

    render(<PrescriptionForm patient={patient} />);

    // Find and type into autocomplete
    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'astemix' } });

    // Click candidate
    const option = screen.getByText('Astemix siro');
    fireEvent.click(option);

    // Verify row added with prefilled data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Astemix siro')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Chai')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
    });
  });

  it('Requirement: should trigger catalog invalidation upon successful prescription creation', async () => {
    mockCreatePrescription.mockResolvedValueOnce({
      success: true,
      data: { id: 850, patient_id: 96 },
    });

    const { default: PrescriptionForm } = await import('@/components/features/prescriptions/PrescriptionForm');
    const patient = { id: 96, name: 'Nguyễn Kiều Anh', age: 3, weight: 12 } as any;

    render(<PrescriptionForm patient={patient} />);

    // Add diagnosis
    const diagnosisInput = screen.getByPlaceholderText(/nhập chẩn đoán/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng cấp' } });

    // Add medicine
    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'astemix' } });
    fireEvent.click(screen.getByText('Astemix siro'));

    // Submit prescription
    const submitBtn = screen.getByRole('button', { name: /lưu đơn thuốc/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePrescription).toHaveBeenCalled();
      expect(mockInvalidateCatalog).toHaveBeenCalled();
    });
  });
});
```

