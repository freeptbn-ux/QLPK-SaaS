import { renderHook, waitFor } from '@testing-library/react';
import { useMedicineDosage } from '../useMedicineDosage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useMedicineDosage', () => {
  const cache = { current: new Map<string, string>() };

  beforeEach(() => {
    cache.current.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch dosage when medicineName is provided', async () => {
    const mockData = { success: true, data: { dosageInfo: 'Dosage info' } };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useMedicineDosage({ medicineName: 'Paracetamol', cache }));

    await waitFor(() => expect(result.current.data).toBe('Dosage info'), { timeout: 3000 });
    expect(cache.current.get('Paracetamol')).toBe('Dosage info');
  });

  it('should use cache if available', async () => {
    cache.current.set('Paracetamol', 'Cached dosage');
    
    const { result } = renderHook(() => useMedicineDosage({ medicineName: 'Paracetamol', cache }));

    await waitFor(() => expect(result.current.data).toBe('Cached dosage'), { timeout: 3000 });
    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should sanitize medicine name', async () => {
    const mockData = { success: true, data: { dosageInfo: 'Dosage info' } };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    // Name with special characters should be sanitized to "Paracetamol"
    renderHook(() => useMedicineDosage({ medicineName: 'Paracetamol!!!', cache }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(callBody.medicineName).toBe('Paracetamol');
  });

  it('should handle 503 error as rate limit busy message', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Busy' }),
    });

    const { result } = renderHook(() => useMedicineDosage({ medicineName: 'BusyMed', cache }));

    await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 3000 });
    expect(result.current.error).toContain('Dịch vụ đang bận');
  });
});
