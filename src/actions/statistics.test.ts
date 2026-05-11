import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as statistics from './statistics';
import { getAuthUser } from '@/lib/supabase/auth';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Mock Supabase
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Statistics Actions (Post-Hardening)', () => {
  const mockSupabase: any = {
    rpc: vi.fn(),
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up chainable mocks
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.gte.mockReturnValue(mockSupabase);
    mockSupabase.lte.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);

    (getAuthUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      clinicId: 123,
      supabase: mockSupabase 
    });
  });

  it('getStatsByDayForMonth should query clinic_daily_stats with clinic_id', async () => {
    const mockData = [{ date: '2024-05-01', visit_count: 10 }];
    mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getStatsByDayForMonth('2024-05');

    expect(mockSupabase.from).toHaveBeenCalledWith('clinic_daily_stats');
    expect(mockSupabase.eq).toHaveBeenCalledWith('clinic_id', 123);
    expect(result).toEqual([{ name: '01/05', count: 10 }]);
  });

  it('getRevenueStats (day) should return daily data', async () => {
    const mockData = [{ date: '2024-05-01', total_revenue: 1000 }];
    mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getRevenueStats('day', '2024-05');

    expect(result).toEqual([{ name: '01/05', revenue: 1000 }]);
  });

  it('getRevenueStats (month) should aggregate daily data into months', async () => {
    const mockData = [
      { date: '2024-05-01', total_revenue: 1000 },
      { date: '2024-05-15', total_revenue: 500 },
      { date: '2024-04-01', total_revenue: 2000 },
    ];
    mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getRevenueStats('month');

    // Expected: April 2024 (2000), May 2024 (1500)
    expect(result).toEqual(expect.arrayContaining([
      { name: '05/2024', revenue: 1500 },
      { name: '04/2024', revenue: 2000 }
    ]));
  });

  it('getRevenueStats (week) should aggregate daily data into ISO weeks', async () => {
    const mockData = [
      { date: '2024-05-01', total_revenue: 1000 }, // W18
      { date: '2024-05-02', total_revenue: 500 },  // W18
      { date: '2024-05-06', total_revenue: 2000 }, // W19
    ];
    mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getRevenueStats('week');

    expect(result).toEqual(expect.arrayContaining([
      { name: '2024-W18', revenue: 1500 },
      { name: '2024-W19', revenue: 2000 }
    ]));
  });

  it('getOverviewStats should use clinic_daily_stats and filter by clinic_id', async () => {
    // Reset specific mocks for Promise.all
    mockSupabase.eq.mockImplementation((key: string, value: any) => {
        if (key === 'clinic_id') return mockSupabase;
        return mockSupabase;
    });

    mockSupabase.gte.mockResolvedValue({ 
      data: [
        { visit_count: 10, total_revenue: 1000 },
        { visit_count: 5, total_revenue: 500 }
      ], 
      error: null 
    });
    
    // We need to distinguish between the two calls in Promise.all
    // Patients call uses head: true
    // Stats call uses gte
    
    mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'patients') {
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ count: 100, error: null })
            };
        }
        return mockSupabase;
    });

    mockSupabase.rpc.mockImplementation((rpc: string) => {
      if (rpc === 'get_low_stock_count') return Promise.resolve({ data: 5, error: null });
      return Promise.resolve({ data: null, error: null });
    });

    const result = await statistics.getOverviewStats();

    expect(result).toEqual({
      totalPatients: 100,
      monthlyVisits: 15,
      monthlyRevenue: 1500,
      lowStockCount: 5,
    });
    
    // Verify security: clinic_id must be filtered
    expect(mockSupabase.eq).toHaveBeenCalledWith('clinic_id', 123);
  });
});
