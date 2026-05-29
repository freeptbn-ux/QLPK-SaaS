import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPatients } from '@/actions/patients';
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

describe('Phase 02: Database Query Optimizations', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
    
    // Default mock response for range(). 
    // Important: searchPatients returns { data, count }
    mockSupabase.range.mockResolvedValue({ 
      data: [{ id: 1, name: 'Test Patient' }], 
      error: null, 
      count: 100 
    });
  });

  describe('searchPatients optimization', () => {
    it('should use estimated count strategy for performance', async () => {
      await searchPatients('test', 1, 10);

      // Verify that .select('*', { count: 'estimated' }) was called
      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'estimated' });
      
      // Ensure it's not using 'exact' anymore
      const selectCalls = (mockSupabase.select as any).mock.calls;
      const hasExactCount = selectCalls.some((call: any) => 
        call[1] && call[1].count === 'exact'
      );
      expect(hasExactCount).toBe(false);
    });

    it('should still return data and count correctly', async () => {
      const result = await searchPatients('test', 1, 10);
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test Patient');
      expect(result.count).toBe(100);
    });
  });
});
