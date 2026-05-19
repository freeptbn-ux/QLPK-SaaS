import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthUser } from '../src/lib/supabase/auth';

// Mock react's cache
vi.mock('react', () => ({
  cache: vi.fn((fn) => fn),
}));

// Mock auth
vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { getLowStockMedicines } from '../src/actions/medicines';

describe('getLowStockMedicines', () => {
  const mockSupabase: any = {
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes clinicId to get_low_stock_medicines RPC', async () => {
    (getAuthUser as any).mockResolvedValue({
      supabase: mockSupabase,
      clinicId: 123,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: [{ id: 1, name: 'Medicine A' }],
      error: null,
    });

    const result = await getLowStockMedicines();

    expect(result).toEqual([{ id: 1, name: 'Medicine A' }]);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_low_stock_medicines', {
      p_clinic_id: 123,
    });
  });

  it('returns [] when clinicId is missing', async () => {
    (getAuthUser as any).mockResolvedValue({
      supabase: mockSupabase,
      clinicId: null,
    });

    const result = await getLowStockMedicines();

    expect(result).toEqual([]);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('throws sanitized generic error when RPC fails', async () => {
    (getAuthUser as any).mockResolvedValue({
      supabase: mockSupabase,
      clinicId: 123,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'Not authorized for clinic' },
    });

    await expect(getLowStockMedicines()).rejects.toThrow();
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_low_stock_medicines', {
      p_clinic_id: 123,
    });
  });
});
