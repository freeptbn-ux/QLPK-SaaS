import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateMedicineStock } from '../actions/medicines';
import * as supabaseServer from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('updateMedicineStock', () => {
  const mockRpc = vi.fn();
  const mockSupabase = {
    rpc: mockRpc,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);
  });

  it('should call adjust_medicine_stock RPC with correct parameters', async () => {
    mockRpc.mockResolvedValue({ data: { success: true }, error: null });

    const result = await updateMedicineStock(1, 5, 'Nhập thêm hàng');

    expect(result).toEqual({ success: true });
    expect(mockRpc).toHaveBeenCalledWith('adjust_medicine_stock', {
      p_medicine_id: 1,
      p_adjustment: 5,
      p_reason: 'Nhập thêm hàng'
    });
    expect(revalidatePath).toHaveBeenCalledWith('/medicines');
  });

  it('should use default reason if none provided', async () => {
    mockRpc.mockResolvedValue({ data: { success: true }, error: null });

    await updateMedicineStock(1, -2);

    expect(mockRpc).toHaveBeenCalledWith('adjust_medicine_stock', {
      p_medicine_id: 1,
      p_adjustment: -2,
      p_reason: 'Điều chỉnh thủ công'
    });
  });

  it('should throw error if validation fails', async () => {
    // adjustment must be a number, but zod will catch if it's missing or wrong type
    // In TS, we can test with 'any' to bypass compile check for the test
    await expect(updateMedicineStock(1, 'invalid' as any)).rejects.toThrow();
  });

  it('should throw error if RPC fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    await expect(updateMedicineStock(1, 5)).rejects.toThrow('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
  });
});
