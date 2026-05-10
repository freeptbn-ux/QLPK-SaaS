import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllMedicines } from './medicines';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock Supabase
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Medicines Performance Optimization Tests', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      supabase: mockSupabase 
    });
  });

  describe('getAllMedicines', () => {
    it('should apply pagination parameters correctly', async () => {
      mockSupabase.range.mockResolvedValue({ data: [], error: null, count: 50 });

      const result = await getAllMedicines({ page: 2, limit: 15 });

      expect(mockSupabase.from).toHaveBeenCalledWith('medicines');
      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockSupabase.range).toHaveBeenCalledWith(15, 29); // (2-1)*15 = 15, 15+15-1 = 29
      expect(result).toEqual({
        data: [],
        count: 50,
        page: 2,
        limit: 15
      });
    });

    it('should apply search filter when provided', async () => {
      mockSupabase.range.mockResolvedValue({ data: [], error: null, count: 5 });

      await getAllMedicines({ search: 'Paracetamol' });

      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%Paracetamol%');
    });

    it('should use default values when no params provided', async () => {
      mockSupabase.range.mockResolvedValue({ data: [], error: null, count: 0 });

      await getAllMedicines();

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 19); // Default page 1, limit 20
    });

    it('should throw error when database returns error', async () => {
      mockSupabase.range.mockResolvedValue({ data: null, error: { message: 'Database error' }, count: null });

      await expect(getAllMedicines()).rejects.toThrow();
    });
  });
});
