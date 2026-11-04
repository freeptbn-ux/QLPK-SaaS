# Phase 01: Client-Side Medicine Catalog Cache Engine

**Status:** ✅ Completed  
**Dependencies:** None  

---

## 1. Objective

Establish a lightweight client-side catalog caching engine that prefetches active medicines for the authenticated clinic, caches the dataset in browser memory across component remounts, and provides instantaneous access to the catalog with background revalidation.

---

## 2. Scope

- **In Scope:**
  - Design and implement a client-side hook or service module (`src/hooks/useMedicineCatalog.ts` or equivalent) that manages active medicine data caching.
  - Utilize existing server action `getAllActiveMedicines()` from `src/actions/medicines.ts` as the primary data source.
  - Implement an in-memory cache store with timestamp tracking (TTL / Stale-While-Revalidate pattern) so subsequent reads within the session are synchronous.
  - Support manual cache invalidation / forced refresh triggered by mutation actions (e.g., adding medicine, updating stock).
  - Provide a safe fallback mechanism if network fetching fails or returns an empty payload.
  - Create a comprehensive file-based test suite verifying caching mechanics, background revalidation, cache eviction/invalidation, and error recovery.

- **Out of Scope:**
  - Modifying the visual autocomplete dropdown markup or keyboard event listeners (covered in Phase 02).
  - Database schema changes or modifying the Supabase RPC functions.

---

## 3. Requirements

### Functional Requirements
- **Synchronous Cache Return:** If the active medicines list is already cached in memory and fresh, the cache accessor must return the data synchronously on initial component render without triggering a loading spinner.
- **Background Prefetch & Revalidate:** On initial application / form load, fetch active medicines asynchronously and store them in memory. If cached data is older than the configured TTL (e.g., 5 minutes), return stale data immediately while initiating a background refresh.
- **Tenant Isolation:** Cache keys must incorporate the active clinic identifier to prevent cross-tenant data leakage if user contexts change.
- **Manual Invalidation:** Expose an `invalidateMedicineCatalog()` function that clears or forces a fresh refetch of the catalog.
- **Graceful Error Handling:** If the network request fails, retain previously cached entries if available and surface a non-blocking error status.

### Non-Functional Requirements
- **Zero Overhead Re-renders:** Repeated calls to the hook from different components on the same page must share the in-memory cache reference without triggering redundant network requests.
- **Memory Footprint:** The in-memory cache must retain only the necessary searchable attributes (`id`, `name`, `unit`, `packing_spec`, `price`, `stock_quantity`, `min_stock_level`), consuming less than 1MB of browser memory.

---

## 4. Constraints

- Must work seamlessly with Next.js 16 App Router and React 19 client components.
- Do not introduce heavy external global state management libraries unless already present in `package.json`.
- Must remain compatible with existing unit test infrastructure in `vitest`.

---

## 5. Dependencies

- `src/actions/medicines.ts` (`getAllActiveMedicines`)
- `src/types/database.ts` (`Medicine`)
- Vitest testing framework

---

## 6. Acceptance Criteria

1. A reusable hook or client module provides access to the active medicine catalog.
2. The initial call triggers a single fetch to `getAllActiveMedicines()`; subsequent calls return the cached catalog immediately without initiating additional network requests.
3. Invalidation function successfully marks cache as dirty and triggers a refresh upon next access.
4. If the fetch fails, cached items are preserved without crashing the consuming component.
5. Exactly one comprehensive file-based test in `tests/phase-01-medicine-catalog-cache.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-01-medicine-catalog-cache.test.ts`  
**Purpose:** Verify in-memory catalog caching, request deduplication, Stale-While-Revalidate TTL behavior, forced invalidation, and error resilience.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock server action
const mockGetAllActiveMedicines = vi.fn();

vi.mock('@/actions/medicines', () => ({
  getAllActiveMedicines: (...args: any[]) => mockGetAllActiveMedicines(...args),
}));

describe('Phase 01: Client-Side Medicine Catalog Cache Engine', () => {
  const sampleMedicines = [
    { id: 1, name: 'Paracetamol 500mg', unit: 'Viên', price: 1000, stock_quantity: 50, min_stock_level: 10, is_active: true },
    { id: 2, name: 'Amoxicillin 500mg', unit: 'Viên', price: 2000, stock_quantity: 20, min_stock_level: 5, is_active: true },
    { id: 3, name: 'Berberin 100mg', unit: 'Viên', price: 500, stock_quantity: 0, min_stock_level: 10, is_active: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement: should fetch medicines on first mount and cache results in memory', async () => {
    mockGetAllActiveMedicines.mockResolvedValueOnce({ data: sampleMedicines, error: null });

    const { useMedicineCatalog, clearMedicineCatalogCache } = await import('@/hooks/useMedicineCatalog');
    clearMedicineCatalogCache();

    const { result } = renderHook(() => useMedicineCatalog());

    await waitFor(() => {
      expect(result.current.medicines).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(1);

    // Second hook instantiation should resolve synchronously from cache without new network call
    const { result: secondResult } = renderHook(() => useMedicineCatalog());
    expect(secondResult.current.medicines).toHaveLength(3);
    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(1);
  });

  it('Requirement: should deduplicate concurrent requests across multiple components', async () => {
    let resolvePromise: (val: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetAllActiveMedicines.mockReturnValueOnce(pendingPromise);

    const { useMedicineCatalog, clearMedicineCatalogCache } = await import('@/hooks/useMedicineCatalog');
    clearMedicineCatalogCache();

    const { result: hook1 } = renderHook(() => useMedicineCatalog());
    const { result: hook2 } = renderHook(() => useMedicineCatalog());

    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(1);
    expect(hook1.current.isLoading).toBe(true);
    expect(hook2.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({ data: sampleMedicines, error: null });
    });

    await waitFor(() => {
      expect(hook1.current.isLoading).toBe(false);
      expect(hook2.current.isLoading).toBe(false);
      expect(hook1.current.medicines).toHaveLength(3);
      expect(hook2.current.medicines).toHaveLength(3);
    });
  });

  it('Requirement: should re-fetch and update cache when invalidateMedicineCatalog is triggered', async () => {
    mockGetAllActiveMedicines
      .mockResolvedValueOnce({ data: sampleMedicines, error: null })
      .mockResolvedValueOnce({
        data: [...sampleMedicines, { id: 4, name: 'Cefixim 200mg', unit: 'Viên', price: 5000, stock_quantity: 15, is_active: true }],
        error: null,
      });

    const { useMedicineCatalog, invalidateMedicineCatalog, clearMedicineCatalogCache } = await import('@/hooks/useMedicineCatalog');
    clearMedicineCatalogCache();

    const { result } = renderHook(() => useMedicineCatalog());

    await waitFor(() => {
      expect(result.current.medicines).toHaveLength(3);
    });

    await act(async () => {
      await invalidateMedicineCatalog();
    });

    await waitFor(() => {
      expect(result.current.medicines).toHaveLength(4);
    });

    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(2);
  });

  it('Requirement: should retain stale cache and surface error state gracefully if fetch fails', async () => {
    mockGetAllActiveMedicines
      .mockResolvedValueOnce({ data: sampleMedicines, error: null })
      .mockRejectedValueOnce(new Error('Network error'));

    const { useMedicineCatalog, invalidateMedicineCatalog, clearMedicineCatalogCache } = await import('@/hooks/useMedicineCatalog');
    clearMedicineCatalogCache();

    const { result } = renderHook(() => useMedicineCatalog());

    await waitFor(() => {
      expect(result.current.medicines).toHaveLength(3);
    });

    await act(async () => {
      try {
        await invalidateMedicineCatalog();
      } catch {
        // Handled internally
      }
    });

    // Should retain existing 3 medicines while reporting error
    expect(result.current.medicines).toHaveLength(3);
    expect(result.current.error).toBeDefined();
  });
});
```

