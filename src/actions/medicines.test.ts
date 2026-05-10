import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllMedicines } from './medicines';
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

describe('medicines actions', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    ilike: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as any).mockResolvedValue({
      user: { id: 'user-id' },
      supabase: mockSupabase,
    });
  });

  describe('getAllMedicines', () => {
    it('should select specific columns', async () => {
      await getAllMedicines();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('medicines');
      expect(mockSupabase.select).toHaveBeenCalledWith(
        'id, name, packing_spec, price, stock_quantity, min_stock_level',
        { count: 'exact' }
      );
    });

    it('should apply search filter if provided', async () => {
      await getAllMedicines({ search: 'Paracetamol' });
      
      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%Paracetamol%');
    });

    it('should apply correct range for pagination', async () => {
      await getAllMedicines({ page: 2, limit: 10 });
      
      expect(mockSupabase.range).toHaveBeenCalledWith(10, 19);
    });
  });
});
