import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllSettings } from './settings';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock Supabase
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Settings Cache Tests', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      supabase: mockSupabase 
    });
  });

  describe('getAllSettings', () => {
    it('should fetch settings and format them as a record', async () => {
      mockSupabase.select.mockResolvedValue({ 
        data: [
          { key: 'clinic_name', value: 'Test Clinic' },
          { key: 'consultation_fee', value: '50000' }
        ], 
        error: null 
      });

      const result = await getAllSettings();

      expect(mockSupabase.from).toHaveBeenCalledWith('settings');
      expect(result).toEqual({
        clinic_name: 'Test Clinic',
        consultation_fee: '50000'
      });
    });

    it('should return empty record on error', async () => {
      mockSupabase.select.mockResolvedValue({ data: null, error: { message: 'Fetch error' } });

      const result = await getAllSettings();

      expect(result).toEqual({});
    });
  });
});
