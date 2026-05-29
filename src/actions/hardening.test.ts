import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPatient } from './patients';
import { createPrescription } from './prescriptions';
import { addMedicine } from './medicines';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Action Hardening', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as unknown as { mockResolvedValue: (val: unknown) => void }).mockResolvedValue(mockSupabase);
  });

  describe('Patient Actions', () => {
    it('addPatient should block mass assignment and only insert whitelisted fields', async () => {
      mockSupabase.rpc.mockResolvedValue({ 
        data: [{ patient_data: { id: 1, name: 'John Doe' }, is_existing: false }], 
        error: null 
      });

      const dirtyData: Record<string, unknown> = {
        name: 'John Doe',
        id: 999, // Should be ignored
        role: 'admin', // Should be ignored
        is_admin: true, // Should be ignored
        dob: '1990-01-01',
        gender: 'Nam',
        phone: '0123456789'
      };

      await addPatient(dirtyData);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('upsert_patient', expect.objectContaining({
        p_name: 'John Doe',
        p_dob: '1990-01-01',
        p_gender: 'Nam',
        p_phone: '0123456789'
      }));
      
      const rpcArgs = mockSupabase.rpc.mock.calls[0][1];
      // Verify that extra fields were not passed to RPC
      expect(rpcArgs.id).toBeUndefined();
      expect(rpcArgs.role).toBeUndefined();
      expect(rpcArgs.is_admin).toBeUndefined();
    });

    it('addPatient should throw error if name is empty', async () => {
      const invalidData: Record<string, unknown> = { name: '', dob: '1990-01-01', gender: 'Nam', phone: '0123' };
      await expect(addPatient(invalidData)).rejects.toThrow('Tên bệnh nhân không được để trống');
    });
  });

  describe('Prescription Actions', () => {
    it('createPrescription should throw error if items are empty', async () => {
      const invalidData: Record<string, unknown> = {
        patient_id: 1,
        diagnosis: 'Flu',
        items: [],
        consultation_fee: 30000
      };
      const result = await createPrescription(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cần ít nhất 1 loại thuốc');
    });

    it('createPrescription should round floating point prices', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 123, error: null });

      const data: Record<string, unknown> = {
        patient_id: 1,
        diagnosis: 'Flu',
        items: [
          { medicine_id: 1, medicine_name: 'Med A', packing_spec: 'Box', quantity: 2, unit_price: 100.55 }
        ],
        consultation_fee: 29999.99
      };

      await createPrescription(data);

      const rpcArgs = mockSupabase.rpc.mock.calls[0][1];
      expect(rpcArgs.p_consultation_fee).toBe(30000);
      expect(rpcArgs.p_items[0].unit_price).toBe(101);
    });
  });

  describe('Medicine Actions', () => {
    it('addMedicine should throw error if price is negative', async () => {
      const invalidData: Record<string, unknown> = {
        name: 'Bad Medicine',
        price: -100
      };
      await expect(addMedicine(invalidData)).rejects.toThrow('Giá phải >= 0');
    });
  });
});
