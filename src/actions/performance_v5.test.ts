import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientsPaginated, getPatientById, getPatientPrescriptionsPaginated } from './patients';
import { getOverviewStats } from './statistics';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Phase 05: Data Fetching Optimization Tests', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    rpc: vi.fn(),
    gte: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  describe('getPatientsPaginated', () => {
    it('should use estimated count', async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: [], error: null });
      mockSupabase.range.mockResolvedValue({ data: [], error: null, count: 100 });

      await getPatientsPaginated(1, 10);

      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'estimated' });
    });
  });

  describe('getPatientById', () => {
    it('should split fetching into patient and limited prescriptions', async () => {
      const mockPatient = { id: 1, name: 'Test Patient' };
      const mockPrescriptions = [{ id: 101, total_amount: 50000 }];
      
      // Mock patient query
      mockSupabase.maybeSingle.mockResolvedValue({ data: mockPatient, error: null });
      // Mock prescriptions query
      mockSupabase.limit.mockResolvedValue({ data: mockPrescriptions, error: null, count: 15 });

      const result = await getPatientById(1);

      expect(mockSupabase.from).toHaveBeenCalledWith('patients');
      expect(mockSupabase.from).toHaveBeenCalledWith('prescriptions_header');
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
      expect(mockSupabase.select).toHaveBeenCalledWith('*, prescription_details(*, medicines(name, packing_spec))', { count: 'exact' });
      
      expect(result).toEqual({
        ...mockPatient,
        prescriptions: mockPrescriptions,
        totalPrescriptions: 15
      });
    });
  });

  describe('getPatientPrescriptionsPaginated', () => {
    it('should fetch prescriptions with range and return hasMore', async () => {
      const mockPrescriptions = Array(10).fill({ id: 1 });
      mockSupabase.range.mockResolvedValue({ data: mockPrescriptions, error: null, count: 25 });

      const result = await getPatientPrescriptionsPaginated(1, 1, 10);

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(result.hasMore).toBe(true);
      expect(result.data.length).toBe(10);
    });

    it('should return hasMore false when on last page', async () => {
      const mockPrescriptions = Array(5).fill({ id: 1 });
      mockSupabase.range.mockResolvedValue({ data: mockPrescriptions, error: null, count: 25 });

      const result = await getPatientPrescriptionsPaginated(1, 3, 10);

      expect(mockSupabase.range).toHaveBeenCalledWith(20, 29);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getOverviewStats', () => {
    it('should use monthly revenue RPC and estimated count', async () => {
      mockSupabase.rpc.mockImplementation((name) => {
        if (name === 'get_monthly_revenue_total') return { data: 5000000, error: null };
        if (name === 'get_low_stock_count') return { data: 5, error: null };
        return { data: null, error: null };
      });
      
      // Mock head queries
      mockSupabase.select.mockResolvedValueOnce({ count: 1000, error: null }); // patients
      mockSupabase.gte.mockResolvedValueOnce({ count: 50, error: null }); // visits

      const result = await getOverviewStats();

      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'estimated', head: true });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_monthly_revenue_total');
      expect(result.monthlyRevenue).toBe(5000000);
      expect(result.totalPatients).toBe(1000);
      expect(result.monthlyVisits).toBe(50);
    });
  });
});
