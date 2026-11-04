# Phase 02: Zero-Latency In-Memory Vietnamese Token Search & Autocomplete UI

**Status:** ✅ Completed  
**Dependencies:** Phase 01  

---

## 1. Objective

Upgrade `MedicineAutocomplete` to perform instantaneous, sub-millisecond candidate filtering completely in browser memory using the client-side catalog cache. Support multi-word tokenized search and Vietnamese diacritic-insensitive matching without displaying server loading spinners or triggering network waterfalls.

---

## 2. Scope

- **In Scope:**
  - Refactor `src/components/features/prescriptions/MedicineAutocomplete.tsx` to search against the in-memory catalog provided by Phase 01.
  - Implement tokenized search: splitting the search query into tokens and verifying that all tokens match the normalized unaccented name of the medicine (e.g., typing `"para 500"` matches `"Paracetamol 500 vỉ xanh"`).
  - Eliminate the `"Đang tìm kiếm..."` spinner for cached catalog searches so dropdown suggestions appear instantaneously on keystrokes.
  - Retain full keyboard navigation (Arrow Down, Arrow Up, Enter to select, Escape to close) and accessibility attributes (`role="combobox"`, `aria-expanded`).
  - Maintain exclusion of already prescribed medicines via `excludeIds`.
  - Preserve visual stock indicators (out-of-stock badge, low-stock warnings, price formatting).
  - Create a comprehensive file-based test suite verifying instant rendering, Vietnamese diacritic normalization, multi-word matching, stock filtering, and keyboard control.

- **Out of Scope:**
  - Persisting prescription data to the database (handled in Phase 03).
  - Modifying the styling or layout of the parent prescription form.

---

## 3. Requirements

### Functional Requirements
- **Instant Result Rendering:** Keystrokes must filter cached medicines synchronously in under 5ms, displaying up to 20 matching medicines immediately in the dropdown.
- **Vietnamese Diacritic-Insensitive Search:** Searching with or without accents (e.g., `"thuoc ho"`, `"thuốc ho"`, `"paracetamol"`, `"paracetamôl"`) must match accurately using `removeDiacritics`.
- **Multi-Word Token Matching:** Entering multiple whitespace-separated tokens (e.g., `"para 500"`, `"au 281"`) must require all tokens to be present within the target medicine's normalized text.
- **Excluded Items:** Medicines present in `excludeIds` must not appear in the search results dropdown.
- **Out-of-Stock Handling:** Items with `stock_quantity === 0` must display an out-of-stock indicator and prevent selection with an appropriate alert/toast.
- **Keyboard Navigation:** Pressing Arrow Down/Up must highlight options; pressing Enter must select the highlighted option; pressing Escape or clicking outside must dismiss the dropdown.

### Non-Functional Requirements
- **Fluid Typing (60fps):** Keystroke event processing must execute within the 16ms frame budget without main-thread blocking or visual stuttering.
- **Zero Network Invocations During Keystrokes:** Typing inside the autocomplete input when the catalog is loaded must not dispatch any HTTP requests or Server Action RPCs.

---

## 4. Constraints

- Must preserve the exact `MedicineAutocompleteProps` interface (`value`, `onChange`, `onSelect`, `excludeIds`, `placeholder`, `className`).
- Backward compatibility: must function properly both in `PrescriptionForm` and in `PrescriptionHistory` modal edit dialogs.

---

## 5. Dependencies

- Phase 01 (`useMedicineCatalog`)
- `src/lib/utils/normalize.ts` (`removeDiacritics`)
- `src/types/database.ts` (`Medicine`)
- Vitest and `@testing-library/react`

---

## 6. Acceptance Criteria

1. Typing in `MedicineAutocomplete` produces matching dropdown options synchronously with zero network requests.
2. Multi-word search terms correctly filter candidate medicines regardless of Vietnamese accents.
3. Out-of-stock items are visually highlighted and blocked from selection.
4. Full keyboard navigation operates identically to the existing accessible combobox behavior.
5. Exactly one comprehensive file-based test in `tests/phase-02-instant-medicine-autocomplete.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-02-instant-medicine-autocomplete.test.ts`  
**Purpose:** Verify instant synchronous filtering, Vietnamese accent-insensitive matching, multi-word tokens, out-of-stock prevention, and keyboard navigation.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const sampleCatalog = [
  { id: 1, name: 'Paracetamol 500mg vỉ xanh', unit: 'Vỉ', price: 12000, stock_quantity: 20, min_stock_level: 5, is_active: true },
  { id: 2, name: 'Paracetamol DHG 150mg', unit: 'Gói', price: 1500, stock_quantity: 100, min_stock_level: 10, is_active: true },
  { id: 3, name: 'Aubactam 281', unit: 'Lọ', price: 45000, stock_quantity: 15, min_stock_level: 3, is_active: true },
  { id: 4, name: 'Deslotid 30ml siro', unit: 'Chai', price: 35000, stock_quantity: 0, min_stock_level: 2, is_active: true }, // Out of stock
];

// Mock catalog hook
vi.mock('@/hooks/useMedicineCatalog', () => ({
  useMedicineCatalog: () => ({
    medicines: sampleCatalog,
    isLoading: false,
    error: null,
  }),
}));

// Mock toast
const mockShowToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('Phase 02: Zero-Latency In-Memory Vietnamese Token Search & Autocomplete UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement: should filter options synchronously upon keystroke without network delay', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(<MedicineAutocomplete onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    // Type query
    fireEvent.change(input, { target: { value: 'para' } });

    // Results must appear immediately without waiting for timers or network
    expect(screen.getByText('Paracetamol 500mg vỉ xanh')).toBeInTheDocument();
    expect(screen.getByText('Paracetamol DHG 150mg')).toBeInTheDocument();
    expect(screen.queryByText('Aubactam 281')).not.toBeInTheDocument();
  });

  it('Requirement: should support multi-word tokenized search with Vietnamese unaccented matching', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(<MedicineAutocomplete onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    // Multi-word unaccented search
    fireEvent.change(input, { target: { value: 'vi xanh 500' } });

    expect(screen.getByText('Paracetamol 500mg vỉ xanh')).toBeInTheDocument();
    expect(screen.queryByText('Paracetamol DHG 150mg')).not.toBeInTheDocument();
  });

  it('Requirement: should exclude IDs specified in excludeIds prop', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(<MedicineAutocomplete onSelect={onSelect} excludeIds={[1]} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'paracetamol' } });

    expect(screen.queryByText('Paracetamol 500mg vỉ xanh')).not.toBeInTheDocument();
    expect(screen.getByText('Paracetamol DHG 150mg')).toBeInTheDocument();
  });

  it('Requirement: should prevent selection of out-of-stock items and alert user', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(<MedicineAutocomplete onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'deslotid' } });

    const outOfStockItem = screen.getByText('Deslotid 30ml siro');
    fireEvent.click(outOfStockItem);

    expect(onSelect).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('hết hàng'), 'error');
  });

  it('Requirement: should navigate options via Arrow keys and select using Enter key', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(<MedicineAutocomplete onSelect={onSelect} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'para' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(sampleCatalog[0]);
  });
});
```

