import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMedicinesForSearch } from '../medicines';
import { getAuthUser } from '@/lib/supabase/auth';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  cache: (fn: any) => fn,
}));

vi.mock('react', () => ({
  cache: (fn: any) => fn,
}));

describe('getMedicinesForSearch', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify auth and fetch only active medicines for the correct clinicId ordered by name', async () => {
    const mockData = [
      { id: 1, name: 'Amoxicillin', packing_spec: 'Box', price: 100, stock_quantity: 50, min_stock_level: 10 },
      { id: 2, name: 'Paracetamol', packing_spec: 'Blister', price: 20, stock_quantity: 200, min_stock_level: 20 },
    ];

    (getAuthUser as any).mockResolvedValue({
      user: { id: 'user-id' },
      clinicId: 'clinic-123',
      supabase: mockSupabase,
    });

    mockSupabase.limit.mockResolvedValue({ data: mockData, error: null });

    const result = await getMedicinesForSearch();

    expect(getAuthUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('medicines');
    expect(mockSupabase.select).toHaveBeenCalledWith('id, name, packing_spec, price, stock_quantity, min_stock_level');
    expect(mockSupabase.eq).toHaveBeenCalledWith('clinic_id', 'clinic-123');
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    expect(mockSupabase.order).toHaveBeenCalledWith('name', { ascending: true });
    expect(mockSupabase.limit).toHaveBeenCalledWith(1000);
    expect(result).toEqual(mockData);
  });

  it('should throw an error if clinicId is missing', async () => {
    (getAuthUser as any).mockResolvedValue({
      user: { id: 'user-id' },
      clinicId: null,
      supabase: mockSupabase,
    });

    await expect(getMedicinesForSearch()).rejects.toThrow('Không tìm thấy thông tin phòng khám. Vui lòng đăng nhập lại.');
  });

  it('should throw an error if database query fails', async () => {
    (getAuthUser as any).mockResolvedValue({
      user: { id: 'user-id' },
      clinicId: 'clinic-123',
      supabase: mockSupabase,
    });

    mockSupabase.limit.mockResolvedValue({ data: null, error: { message: 'Database failure' } });

    await expect(getMedicinesForSearch()).rejects.toThrow('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
  });
});
