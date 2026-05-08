import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDrugPresets } from '../src/actions/settings';
import { getConsultationFee } from '../src/actions/prescriptions';
import { getAuthUser } from '../src/lib/supabase/auth';
import { getCachedSettings } from '../src/actions/settings';

// Mock dependencies
vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn), // Simple mock to call the function
}));

// We need to mock getCachedSettings from settings.ts when testing prescriptions.ts
vi.mock('../src/actions/settings', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getCachedSettings: vi.fn(),
    getDrugPresets: actual.getDrugPresets, // Keep the one we want to test
  };
});

describe('Phase 02 Optimization Verification', () => {
  const mockSupabase: any = {
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as any).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      supabase: mockSupabase 
    });
  });

  describe('getDrugPresets (Cached)', () => {
    it('should fetch and parse drug_presets from settings', async () => {
      const mockData = { value: JSON.stringify([{ name: 'Test Drug' }]) };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await getDrugPresets();

      expect(result).toEqual([{ name: 'Test Drug' }]);
      expect(mockSupabase.from).toHaveBeenCalledWith('settings');
      expect(mockSelect).toHaveBeenCalledWith('value');
      expect(mockEq).toHaveBeenCalledWith('key', 'drug_presets');
    });

    it('should return empty array if drug_presets not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await getDrugPresets();
      expect(result).toEqual([]);
    });
  });

  describe('getConsultationFee (using Cached Settings)', () => {
    it('should use getCachedSettings and return the fee', async () => {
      (getCachedSettings as any).mockResolvedValue({
        consultation_fee: '50000'
      });

      const result = await getConsultationFee();

      expect(getCachedSettings).toHaveBeenCalled();
      expect(result).toBe(50000);
    });

    it('should return default fee if consultation_fee is missing in settings', async () => {
      (getCachedSettings as any).mockResolvedValue({});

      const result = await getConsultationFee();

      expect(result).toBe(30000);
    });
  });
});
