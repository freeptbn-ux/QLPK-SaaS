import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSetting, updateMultipleSettings, saveDrugPresets, getAllSettings } from './settings';
import { getAuthUser } from '@/lib/supabase/auth';
import { revalidatePath, updateTag } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn), // Mock unstable_cache to just return the function
}));

describe('Settings Actions with Caching', () => {
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

  describe('updateSetting', () => {
    it('should call updateTag("settings") after successful update', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      await updateSetting('clinic_name', 'My Clinic');

      expect(mockUpsert).toHaveBeenCalledWith(
        { key: 'clinic_name', value: 'My Clinic' },
        { onConflict: 'clinic_id, key' }
      );
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
      expect(updateTag).toHaveBeenCalledWith('settings');
    });

    it('should throw error if update fails', async () => {
      mockSupabase.from.mockReturnValue({ 
        upsert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }) 
      });

      await expect(updateSetting('clinic_name', 'My Clinic')).rejects.toThrow();
      expect(updateTag).not.toHaveBeenCalled();
    });
  });

  describe('updateMultipleSettings', () => {
    it('should call updateTag("settings") after successful update', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      await updateMultipleSettings({ clinic_name: 'New Name', clinic_phone: '123' });

      expect(updateTag).toHaveBeenCalledWith('settings');
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    });
  });

  describe('saveDrugPresets', () => {
    it('should call updateTag("settings") after successful update', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ upsert: mockUpsert });

      await saveDrugPresets([{ name: 'Paracetamol' }]);

      expect(updateTag).toHaveBeenCalledWith('settings');
      expect(revalidatePath).toHaveBeenCalledWith('/dose-calculator');
    });
  });

  describe('getAllSettings', () => {
    it('should fetch settings from supabase and return a record', async () => {
      const mockData = [
        { key: 'clinic_name', value: 'Test Clinic' },
        { key: 'consultation_fee', value: '100000' }
      ];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const result = await getAllSettings();

      expect(result).toEqual({
        clinic_name: 'Test Clinic',
        consultation_fee: '100000'
      });
    });
  });
});
