import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergePatients, getPotentialDuplicates } from './patients';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock Supabase and Next.js cache
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Patient Merge Actions', () => {
  const mockSupabase = {
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  describe('getPotentialDuplicates', () => {
    it('should call get_potential_duplicates RPC and return data', async () => {
      const mockData = [
        {
          name_normalized: 'nguyen van a',
          dob: '01/01/1990',
          phone: '0123456789',
          patient_ids: [1, 2],
          patient_names: ['Nguyễn Văn A', 'Nguyen Van A'],
          patient_addresses: ['Hà Nội', 'Hà Nội'],
        },
      ];
      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

      const result = await getPotentialDuplicates();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_potential_duplicates');
      expect(result).toEqual(mockData);
    });

    it('should throw error if RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      await expect(getPotentialDuplicates()).rejects.toThrow('Failed to fetch potential duplicates');
    });
  });

  describe('mergePatients', () => {
    it('should call merge_patients RPC with correct parameters', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null });

      const result = await mergePatients(1, [1, 2, 3]);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('merge_patients', {
        master_id: 1,
        duplicate_ids: [2, 3], // Should filter out masterId
      });
      expect(revalidatePath).toHaveBeenCalledWith('/patients');
      expect(result).toEqual({ success: true });
    });

    it('should return early if no duplicates after filtering', async () => {
      const result = await mergePatients(1, [1]);

      expect(mockSupabase.rpc).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'No duplicates to merge' });
    });

    it('should throw error if RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: { message: 'Update failed' } });

      await expect(mergePatients(1, [1, 2])).rejects.toThrow('Failed to merge patients');
    });
  });
});
