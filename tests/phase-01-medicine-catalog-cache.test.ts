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

  it('Requirement: should revalidate in background when cached data exceeds TTL (Stale-While-Revalidate)', async () => {
    const updatedMedicines = [
      ...sampleMedicines,
      { id: 4, name: 'Vitamin C 500mg', unit: 'Viên', price: 800, stock_quantity: 100, is_active: true },
    ];

    mockGetAllActiveMedicines
      .mockResolvedValueOnce({ data: sampleMedicines, error: null })
      .mockResolvedValueOnce({ data: updatedMedicines, error: null });

    const { useMedicineCatalog, clearMedicineCatalogCache } = await import('@/hooks/useMedicineCatalog');
    clearMedicineCatalogCache();

    // Fast-expiring TTL of 50ms
    const { result: initialHook } = renderHook(() => useMedicineCatalog({ ttlMs: 50 }));

    await waitFor(() => {
      expect(initialHook.current.medicines).toHaveLength(3);
      expect(initialHook.current.isLoading).toBe(false);
    });

    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(1);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    // Next render should synchronously return stale data immediately (3 medicines, not loading)
    const { result: staleHook } = renderHook(() => useMedicineCatalog({ ttlMs: 50 }));
    expect(staleHook.current.medicines).toHaveLength(3);
    expect(staleHook.current.isLoading).toBe(false);

    // Background revalidation should have kicked off and resolved to 4 medicines
    await waitFor(() => {
      expect(staleHook.current.medicines).toHaveLength(4);
    });

    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(2);
  });

  it('Requirement: should support tenant isolation with distinct clinic IDs', async () => {
    const clinic1Medicines = [sampleMedicines[0]];
    const clinic2Medicines = [sampleMedicines[1], sampleMedicines[2]];

    mockGetAllActiveMedicines
      .mockResolvedValueOnce({ data: clinic1Medicines, error: null })
      .mockResolvedValueOnce({ data: clinic2Medicines, error: null });

    const { useMedicineCatalog, clearMedicineCatalogCache } = await import('@/hooks/useMedicineCatalog');
    clearMedicineCatalogCache();

    const { result: clinic1Hook } = renderHook(() => useMedicineCatalog({ clinicId: 'clinic-1' }));
    const { result: clinic2Hook } = renderHook(() => useMedicineCatalog({ clinicId: 'clinic-2' }));

    await waitFor(() => {
      expect(clinic1Hook.current.medicines).toHaveLength(1);
      expect(clinic2Hook.current.medicines).toHaveLength(2);
    });

    expect(mockGetAllActiveMedicines).toHaveBeenCalledTimes(2);

    // Clinic 1 should have medicine 1, Clinic 2 should have medicine 2 & 3
    expect(clinic1Hook.current.medicines[0].id).toBe(1);
    expect(clinic2Hook.current.medicines[0].id).toBe(2);
    expect(clinic2Hook.current.medicines[1].id).toBe(3);
  });
});

