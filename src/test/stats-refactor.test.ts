import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOverviewStats } from '@/actions/statistics';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock getAuthUser
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('getOverviewStats Refactor', () => {
  const mockSupabase = {
    from: vi.fn(),
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as any).mockResolvedValue({
      supabase: mockSupabase,
      user: { id: 'test-user' },
      clinicId: 1,
    });
  });

  it('should call clinic_daily_stats for visits and revenue', async () => {
    // Mock patients count
    const mockPatients = {
      select: vi.fn().mockReturnThis(),
      count: 244,
      error: null,
    };
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'patients') {
        return {
          select: vi.fn().mockReturnThis(),
          then: (cb: any) => cb({ count: 244, error: null }),
        };
      }
      if (table === 'clinic_daily_stats') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            // This is a bit tricky to mock nested calls with different returns
            // We'll use a more flexible mock below
            return Promise.resolve({ data: { sum: 100 }, error: null });
          }),
        };
      }
      return {};
    });

    // More precise mock for multiple calls to the same table
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'patients') {
        return {
          select: vi.fn().mockResolvedValue({ count: 244, error: null }),
        };
      }

      if (table === 'clinic_daily_stats') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue({
            data: [
              { visit_count: 20, total_revenue: 200000 },
              { visit_count: 30, total_revenue: 300000 },
            ],
            error: null,
          }),
        };
      }
      return {};
    });

    mockSupabase.rpc.mockResolvedValue({ data: 5, error: null });

    const stats = await getOverviewStats();

    expect(mockSupabase.from).toHaveBeenCalledWith('patients');
    expect(mockSupabase.from).toHaveBeenCalledWith('clinic_daily_stats');
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_low_stock_count');

    expect(stats).toEqual({
      totalPatients: 244,
      monthlyVisits: 50,
      monthlyRevenue: 500000,
      lowStockCount: 5,
    });
  });

  it('should handle zero values and missing data gracefully', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'patients') {
        return { select: vi.fn().mockResolvedValue({ count: 0, error: null }) };
      }
      return {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

    const stats = await getOverviewStats();

    expect(stats).toEqual({
      totalPatients: 0,
      monthlyVisits: 0,
      monthlyRevenue: 0,
      lowStockCount: 0,
    });
  });

  it('should throw error if any query fails', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
    }));

    await expect(getOverviewStats()).rejects.toThrow('Database error');
  });
});
