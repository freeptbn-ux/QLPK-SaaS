import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOverviewStats } from '../actions/statistics';
import { createClient } from '../lib/supabase/server';

// Mock the supabase server client
vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('getOverviewStats', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it('should use "exact" count for patients and prescriptions', async () => {
    // Setup mocks
    mockSupabase.from.mockImplementation((table) => {
      const selectMock = vi.fn().mockImplementation((query, options) => {
        if (options && options.count) {
          expect(options.count).toBe('exact');
        }
        return queryResult;
      });
      
      const queryResult = {
        select: selectMock,
        gte: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ data: [], count: 100, error: null }),
      };
      
      // For Promise.all to work, it needs to be thenable
      Object.assign(queryResult, {
        then: (onFullfilled: any) => Promise.resolve({ data: [], count: 100, error: null }).then(onFullfilled)
      });

      return queryResult as any;
    });

    mockSupabase.rpc.mockImplementation((fn) => {
      if (fn === 'get_monthly_revenue_total') return { data: 5000000, error: null };
      if (fn === 'get_low_stock_count') return { data: 5, error: null };
      return { data: null, error: null };
    });

    const stats = await getOverviewStats();

    expect(stats.totalPatients).toBe(100);
    expect(mockSupabase.from).toHaveBeenCalledWith('patients');
    expect(mockSupabase.from).toHaveBeenCalledWith('prescriptions_header');
  });
});
