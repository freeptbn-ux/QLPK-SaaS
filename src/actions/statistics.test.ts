import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as statistics from './statistics';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Statistics Actions (RPC-based)', () => {
  const mockSupabase = {
    rpc: vi.fn(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  it('getDistinctMonthsYears should call get_distinct_months_years RPC', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [{ month: '2024-05' }, { month: '2024-04' }], error: null });

    const result = await statistics.getDistinctMonthsYears();

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_distinct_months_years');
    expect(result).toEqual(['2024-05', '2024-04']);
  });

  it('getStatsByDayForMonth should call get_stats_by_day_for_month RPC', async () => {
    const mockData = [{ name: '01/05', count: 10 }];
    mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getStatsByDayForMonth('2024-05');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_stats_by_day_for_month', { p_year_month: '2024-05' });
    expect(result).toEqual(mockData);
  });

  it('getStatsByWeek should call get_stats_by_week RPC', async () => {
    const mockData = [{ name: 'W18/2024', count: 5 }];
    mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getStatsByWeek(8);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_stats_by_week', { p_limit: 8 });
    expect(result).toEqual(mockData);
  });

  it('getMedicineUsageStats should call get_medicine_usage_stats RPC', async () => {
    const mockData = [{ name: 'Medicine A', totalQuantity: 10, totalRevenue: 1000 }];
    mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getMedicineUsageStats('2024-05');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_medicine_usage_stats', { p_year_month: '2024-05' });
    expect(result).toEqual(mockData);
  });

  it('getRevenueStats should call get_revenue_stats RPC', async () => {
    const mockData = [{ name: '05/2024', revenue: 5000 }];
    mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

    const result = await statistics.getRevenueStats('month', '2024-05');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_revenue_stats', { p_year_month: '2024-05' });
    expect(result).toEqual(mockData);
  });

  it('getPatientDobsByTime should call get_patient_dobs_by_time RPC', async () => {
     const mockData = [{ dob: '1990-01-01' }];
     mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });
 
     const result = await statistics.getPatientDobsByTime('month', '2024-05');
 
     expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patient_dobs_by_time', {
       p_filter_type: 'month',
       p_time_value: '2024-05',
     });
     expect(result).toEqual(['1990-01-01']);
   });
 
   it('getOverviewStats should aggregate data correctly including RPC call for revenue and low stock', async () => {
     mockSupabase.from.mockImplementation((table: string) => {
       if (table === 'patients') return { select: vi.fn().mockResolvedValue({ count: 100, error: null }) };
       if (table === 'prescriptions_header') return { select: vi.fn().mockReturnThis(), gte: vi.fn().mockResolvedValue({ count: 20, error: null }) };
       return { select: vi.fn().mockReturnThis() };
     });
 
      mockSupabase.rpc.mockImplementation((rpc: string) => {
        if (rpc === 'get_monthly_revenue_total') return Promise.resolve({ data: 1500, error: null });
        if (rpc === 'get_low_stock_count') return Promise.resolve({ data: 5, error: null });
        return Promise.resolve({ data: null, error: null });
      });
 
     const result = await statistics.getOverviewStats();
 
     expect(result).toEqual({
       totalPatients: 100,
       monthlyVisits: 20,
       monthlyRevenue: 1500,
       lowStockCount: 5,
     });
   });
 });
