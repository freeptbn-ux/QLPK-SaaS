# Phase 05: Medicine Autocomplete Client Overhead Elimination (P1)

**Target Issues:** PERF-007  
**Severity:** 🟠 High (P1)  
**Status:** ✅ Completed  
**Dependencies:** Phase 01, Phase 02, Phase 03, Phase 04  

---

## 1. Objective

Eliminate the excessive memory footprint and main-thread UI freezing caused by loading 1,000 medicine records into browser memory and executing synchronous Vietnamese diacritic normalization on every keystroke. Transition `MedicineAutocomplete` to a lightweight, debounced server-side search utilizing indexed database lookups (`search_medicines_v2` / `pg_trgm`) with bounded result sets.

---

## 2. Scope

- **In Scope:**
  - Audit `src/components/prescriptions/MedicineAutocomplete.tsx` and related medicine search server actions.
  - Eliminate the initial client-side full-table fetch (`getAllActiveMedicines()`) that dumps up to 1,000 items (>200KB payload) into browser memory on form mount.
  - Implement a debounced server-driven search flow with request cancellation (`AbortController`) to avoid race conditions during fast typing.
  - Offload Vietnamese diacritic normalization from client-side `useMemo` loops to server/database trigram indexing.
  - Enforce a strict result limit (e.g., 10 to 20 candidate medicines per query).
  - Preserve full keyboard accessibility (Arrow navigation, Enter selection, Escape dismissal) and auto-population of prescription fields (unit, price, stock).
  - Implement a comprehensive file-based test suite verifying lazy loading, debounce behavior, race condition prevention, and keyboard interaction.

- **Out of Scope:**
  - Redesigning the medicine inventory management page (`/medicines`).
  - Altering the medicine schema or database stock adjustment logic.

---

## 3. Requirements

### Functional Requirements
- **Dynamic Search:** As the user enters text into the medicine autocomplete input, matching medicines must be retrieved by trade name, generic name, or unaccented Vietnamese search.
- **Race Condition Prevention:** If a subsequent keystroke fires before a prior request resolves, the prior request must be aborted or discarded so that only the latest query results are displayed.
- **Selection Integrity:** Selecting a suggestion must immediately populate the prescription row with the medicine's ID, name, unit, and default unit price.
- **Empty / Initial State:** When the input is empty or newly focused, display a lightweight suggestion list (e.g., top 10 most prescribed medicines) or a search prompt without fetching 1,000 items.

### Non-Functional & Performance Requirements
- **Zero Full-Table Ingestion:** The component must not fetch the entire active medicine catalog into client memory on mount.
- **Main-Thread Fluidity:** Keystroke input must not block or stutter; synchronous loops running `removeDiacritics` over 1,000 items in render cycles must be completely removed.
- **Bounded Payloads:** Search responses must be capped at $\le 20$ items, keeping network payloads under 10KB.

---

## 4. Constraints

- Must maintain seamless integration with `react-hook-form` inside `PrescriptionForm`.
- Must satisfy all existing accessibility standards (ARIA combobox patterns).

---

## 5. Dependencies

- `src/components/prescriptions/MedicineAutocomplete.tsx`
- `src/actions/medicines.ts` / `searchMedicines` action
- React 19 / Next.js 16 App Router
- Vitest and `@testing-library/react`

---

## 6. Acceptance Criteria

1. `MedicineAutocomplete` does not invoke `getAllActiveMedicines()` on mount.
2. Keystroke searches are debounced and fetch $\le 20$ results per query.
3. Rapid sequential inputs discard stale responses without UI flicker or state inconsistency.
4. Main-thread execution time during typing stays well within the 16ms 60fps frame budget.
5. The comprehensive file-based test in `tests/phase-05-medicine-autocomplete.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-05-medicine-autocomplete.test.ts`  
**Purpose:** Verify that medicine autocomplete does not load 1,000 medicines on mount, uses debounced search queries with result limits, and cleanly handles asynchronous race conditions.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the medicine action module
const mockSearchMedicines = vi.fn();
const mockGetAllActiveMedicines = vi.fn();

vi.mock('@/actions/medicines', () => ({
  searchMedicines: (...args: any[]) => mockSearchMedicines(...args),
  getAllActiveMedicines: (...args: any[]) => mockGetAllActiveMedicines(...args),
}));

describe('Phase 05: Medicine Autocomplete Client Overhead Elimination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement PERF-007: should NOT load all active medicines on component mount', async () => {
    // Dynamic import of the autocomplete component
    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      <MedicineAutocomplete
        value=""
        onChange={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    // Verify that getAllActiveMedicines was NEVER called on mount
    expect(mockGetAllActiveMedicines).not.toHaveBeenCalled();
  });

  it('Requirement PERF-007: should execute debounced search and limit results to <= 20', async () => {
    const mockResults = [
      { id: 'm1', name: 'Paracetamol 500mg', unit: 'Viên', price: 1000, stock_quantity: 50 },
      { id: 'm2', name: 'Panadol Extra', unit: 'Viên', price: 2000, stock_quantity: 30 },
    ];
    mockSearchMedicines.mockResolvedValue({ data: mockResults, error: null });

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      <MedicineAutocomplete
        value=""
        onChange={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox') || screen.getByPlaceholderText(/tìm|thuốc/i);
    expect(input).toBeDefined();

    // Type search query
    fireEvent.change(input, { target: { value: 'para' } });

    // Wait for debounced search execution
    await waitFor(() => {
      expect(mockSearchMedicines).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'para',
          limit: expect.any(Number),
        })
      );
    });

    const callArgs = mockSearchMedicines.mock.calls[0][0];
    expect(callArgs.limit).toBeLessThanOrEqual(20);
  });

  it('Requirement PERF-007: should discard stale in-flight requests during rapid typing', async () => {
    // Simulate delayed response for first query and fast response for second query
    let resolveFirst: any;
    const firstPromise = new Promise((res) => { resolveFirst = res; });
    const secondPromise = Promise.resolve({
      data: [{ id: 'm3', name: 'Amoxicillin 500mg', unit: 'Viên', price: 1500, stock_quantity: 20 }],
      error: null,
    });

    mockSearchMedicines
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      <MedicineAutocomplete
        value=""
        onChange={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox') || screen.getByPlaceholderText(/tìm|thuốc/i);

    // Rapid typing
    fireEvent.change(input, { target: { value: 'par' } });
    fireEvent.change(input, { target: { value: 'amox' } });

    // Wait for second search to display
    await waitFor(() => {
      expect(screen.getByText(/Amoxicillin 500mg/i)).toBeDefined();
    });

    // Resolve late first promise
    resolveFirst({
      data: [{ id: 'm1', name: 'Paracetamol 500mg', unit: 'Viên', price: 1000, stock_quantity: 50 }],
      error: null,
    });

    // Late first query should NOT overwrite the second query results
    await waitFor(() => {
      expect(screen.queryByText(/Paracetamol 500mg/i)).toBeNull();
      expect(screen.getByText(/Amoxicillin 500mg/i)).toBeDefined();
    });
  });
});
```

