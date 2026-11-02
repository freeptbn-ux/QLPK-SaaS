import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom, mockRpc, getCounts, resetCounts, getLastRpcArgs } = vi.hoisted(() => {
  let queryCount = 0;
  let rpcCount = 0;
  let lastRpcArgs: any = null;

  const mockFrom = vi.fn((table: string) => {
    queryCount++;
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            date: '2026-11-01',
            visit_count: 30,
            prescription_count: 35,
            total_revenue: 7000000,
          },
          {
            date: '2026-11-02',
            visit_count: 38,
            prescription_count: 40,
            total_revenue: 8000000,
          },
        ],
        error: null,
      }),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
  });

  const mockRpc = vi.fn((procName: string, params: any) => {
    rpcCount++;
    lastRpcArgs = { procName, params };
    return Promise.resolve({
      data: {
        kpis: {
          total_revenue: 15000000,
          prescription_count: 75,
          patient_visit_count: 68,
          avg_prescription_value: 200000,
        },
        revenue_trends: [
          { date: '2026-11-01', revenue: 7000000, visits: 30 },
          { date: '2026-11-02', revenue: 8000000, visits: 38 },
        ],
        top_medicines: [
          { name: 'Paracetamol 500mg', total_quantity: 150, total_revenue: 1500000 },
          { name: 'Amoxicillin 500mg', total_quantity: 80, total_revenue: 2400000 },
        ],
        demographics: {
          gender: { male: 32, female: 36, other: 0 },
          age_groups: { under_18: 10, adult: 45, elderly: 13 },
        },
      },
      error: null,
    });
  });

  return {
    mockFrom,
    mockRpc,
    getCounts: () => ({ queryCount, rpcCount }),
    resetCounts: () => {
      queryCount = 0;
      rpcCount = 0;
      lastRpcArgs = null;
    },
    getLastRpcArgs: () => lastRpcArgs,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'doc-1', app_metadata: { clinic_id: 'c-1', role: 'doctor' } } },
        error: null,
      }),
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({
    user: { id: 'doc-1' },
    clinic_id: 'c-1',
    role: 'doctor',
  }),
}));

describe('Phase 04: Statistics & Dashboard Waterfall Query Reduction', () => {
  beforeEach(() => {
    resetCounts();
    vi.clearAllMocks();
  });

  it('Requirement PERF-006: should retrieve complete statistics payload in <= 2 database operations', async () => {
    // Import the consolidated statistics action
    const statsModule = await import('@/actions/statistics');

    // Call the primary dashboard data fetcher
    // If refactored into getDashboardStatistics or unified action
    const fetcher = (statsModule as any).getDashboardStatistics || (statsModule as any).getUnifiedStatistics;
    
    expect(typeof fetcher).toBe('function');

    const result = await fetcher({
      startDate: '2026-11-01',
      endDate: '2026-11-02',
    });

    const { queryCount, rpcCount } = getCounts();

    // 1. Verify total database operations is <= 2
    const totalDbOperations = queryCount + rpcCount;
    expect(totalDbOperations).toBeGreaterThan(0);
    expect(totalDbOperations).toBeLessThanOrEqual(2);

    // 2. Verify all expected sections are present in payload
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.kpis).toBeDefined();
    expect(result.data.kpis.total_revenue).toBeDefined();
    expect(result.data.revenue_trends).toBeInstanceOf(Array);
    expect(result.data.top_medicines).toBeInstanceOf(Array);
  });

  it('Requirement PERF-006: should handle RPC fallback in <= 2 queries when RPC returns error', async () => {
    // Override RPC to simulate temporary RPC error or legacy fallback
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'function get_dashboard_statistics does not exist' },
    });

    const statsModule = await import('@/actions/statistics');
    const fetcher = (statsModule as any).getDashboardStatistics;

    const result = await fetcher({
      startDate: '2026-11-01',
      endDate: '2026-11-02',
    });

    const { queryCount, rpcCount } = getCounts();

    // 1 RPC failure + 1 fallback query = 2 operations max (<= 2)
    const totalDbOperations = queryCount + rpcCount;
    expect(totalDbOperations).toBeGreaterThan(0);
    expect(totalDbOperations).toBeLessThanOrEqual(2);

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.kpis.total_revenue).toBe(15000000);
    expect(result.data.kpis.prescription_count).toBe(75);
    expect(result.data.kpis.patient_visit_count).toBe(68);
    expect(result.data.revenue_trends).toHaveLength(2);
  });

  it('Requirement PERF-006: should enforce clinic_id scoping and date preset translation', async () => {
    const statsModule = await import('@/actions/statistics');
    const fetcher = (statsModule as any).getDashboardStatistics;

    await fetcher({
      selectedMonth: '2026-11',
    });

    const lastRpcArgs = getLastRpcArgs();
    expect(lastRpcArgs).toBeDefined();
    expect(lastRpcArgs.procName).toBe('get_dashboard_statistics');
    expect(lastRpcArgs.params.p_clinic_id).toBe('c-1');
    expect(lastRpcArgs.params.p_start_date).toBe('2026-11-01');
    expect(lastRpcArgs.params.p_end_date).toBe('2026-11-30');
  });
});
