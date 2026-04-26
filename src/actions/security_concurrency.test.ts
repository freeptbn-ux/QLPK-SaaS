import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPatient } from './patients';
import { patientFormSchema } from '@/lib/validations/patient';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Phase 06: Security & Concurrency Tests', () => {
  const mockSupabase = {
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase);
  });

  describe('Date Normalization (Schema)', () => {
    it('should normalize DD/MM/YYYY to YYYY-MM-DD', () => {
      const data = { name: 'Test', dob: '19/04/2026', gender: 'Nam', phone: '0123' };
      const result = patientFormSchema.parse(data);
      expect(result.dob).toBe('2026-04-19');
    });

    it('should normalize MM/DD/YYYY to YYYY-MM-DD', () => {
      const data = { name: 'Test', dob: '04/19/2026', gender: 'Nam', phone: '0123' };
      const result = patientFormSchema.parse(data);
      expect(result.dob).toBe('2026-04-19');
    });

    it('should keep age descriptions as is', () => {
      const data = { name: 'Test', dob: '13 tháng', gender: 'Nam', phone: '0123' };
      const result = patientFormSchema.parse(data);
      expect(result.dob).toBe('13 tháng');
    });

    it('should keep "5 tuổi" as is', () => {
      const data = { name: 'Test', dob: '5 tuổi', gender: 'Nam', phone: '0123' };
      const result = patientFormSchema.parse(data);
      expect(result.dob).toBe('5 tuổi');
    });

    it('should fail on empty date', async () => {
      const data = { name: 'Test', dob: '', gender: 'Nam', phone: '0123' };
      await expect(async () => patientFormSchema.parse(data)).rejects.toThrow('Ngày sinh không được để trống');
    });
  });

  describe('addPatient with RPC', () => {
    const validData = {
      name: 'Nguyễn Văn A',
      dob: '20/10/1990',
      gender: 'Nam',
      phone: '0987654321',
    };

    it('should call upsert_patient RPC and return result', async () => {
      const mockPatient = { id: 1, name: 'Nguyễn Văn A', dob: '1990-10-20' };
      mockSupabase.rpc.mockResolvedValue({
        data: [{ patient_data: mockPatient, is_existing: false }],
        error: null
      });

      const result = await addPatient(validData as unknown as Record<string, unknown>);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('upsert_patient', expect.objectContaining({
        p_name: 'Nguyễn Văn A',
        p_dob: '1990-10-20', // Normalized by schema
        p_name_normalized: 'nguyen van a'
      }));

      expect(result).toEqual({ data: mockPatient, isExisting: false });
      expect(revalidatePath).toHaveBeenCalledWith('/patients');
    });

    it('should handle existing patient correctly', async () => {
      const mockPatient = { id: 1, name: 'Nguyễn Văn A', dob: '1990-10-20' };
      mockSupabase.rpc.mockResolvedValue({
        data: [{ patient_data: mockPatient, is_existing: true }],
        error: null
      });

      const result = await addPatient(validData as unknown as Record<string, unknown>);

      expect(result.isExisting).toBe(true);
    });

    it('should throw error if RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      await expect(addPatient(validData as unknown as Record<string, unknown>)).rejects.toThrow('Failed to add/update patient');
    });
  });
});
