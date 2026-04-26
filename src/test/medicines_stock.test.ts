import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMedicineStockByIds } from '../actions/medicines';
import * as supabaseServer from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('getMedicineStockByIds', () => {
  const mockIn = vi.fn();
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();
  const mockSupabase = {
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ in: mockIn });
  });

  it('should return medicine stock data', async () => {
    const mockData = [{ id: 1, name: 'Med 1', stock_quantity: 10 }];
    mockIn.mockResolvedValue({ data: mockData, error: null });

    const result = await getMedicineStockByIds([1]);

    expect(result).toEqual(mockData);
    expect(mockFrom).toHaveBeenCalledWith('medicines');
    expect(mockSelect).toHaveBeenCalledWith('id, name, stock_quantity');
    expect(mockIn).toHaveBeenCalledWith('id', [1]);
  });

  it('should return empty array on error', async () => {
    mockIn.mockResolvedValue({ data: null, error: { message: 'Error' } });

    const result = await getMedicineStockByIds([1]);

    expect(result).toEqual([]);
  });
});
