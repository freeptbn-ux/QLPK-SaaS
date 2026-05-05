import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientsPaginated, searchPatients } from '@/actions/patients';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js headers/cache
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Phase 02: Patient Last Visit Backend', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
  });

  describe('getPatientsPaginated', () => {
    it('should call get_patients_with_last_visit RPC and format results', async () => {
      const mockData = [
        { id: 1, name: 'Patient A', last_visit_date: '2026-04-28T10:00:00Z', total_count: '2' },
        { id: 2, name: 'Patient B', last_visit_date: null, total_count: '2' },
      ];
      
      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

      const result = await getPatientsPaginated(1, 10);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', {
        p_search_term: null,
        p_search_normalized: null,
        p_limit: 10,
        p_offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.data[0]).not.toHaveProperty('total_count');
      expect(result.data[0].last_visit_date).toBe('2026-04-28T10:00:00Z');
      expect(result.data[1].last_visit_date).toBeNull();
    });

    it('should handle empty results correctly', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const result = await getPatientsPaginated(1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it('should throw error if RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC Error' } });

      await expect(getPatientsPaginated(1, 10)).rejects.toThrow();
    });
  });

  describe('searchPatients', () => {
    it('should call get_patients_with_last_visit RPC with search terms', async () => {
      const mockData = [
        { id: 1, name: 'Nguyễn Văn A', last_visit_date: '2026-04-28T10:00:00Z', total_count: '1' },
      ];
      
      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

      const result = await searchPatients('nguyen', 1, 10);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', {
        p_search_term: 'nguyen',
        p_search_normalized: 'nguyen', // removeDiacritics('nguyen') is 'nguyen'
        p_limit: 10,
        p_offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.data[0].name).toBe('Nguyễn Văn A');
    });

    it('should handle search term with diacritics', async () => {
        mockSupabase.rpc.mockResolvedValue({ data: [], error: null });
  
        await searchPatients('Nguyễn', 1, 10);
  
        expect(mockSupabase.rpc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          p_search_term: 'Nguyễn',
          p_search_normalized: 'nguyen', // removeDiacritics('Nguyễn') is 'nguyen'
        }));
      });
  });
});
