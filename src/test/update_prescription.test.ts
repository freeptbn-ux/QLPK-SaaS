import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePrescription } from '../actions/prescriptions';
import * as supabaseServer from '@/lib/supabase/server';
import { updatePrescriptionSchema } from '@/lib/validations/prescription';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/validations/prescription', () => ({
  updatePrescriptionSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('updatePrescription', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
  const mockRpc = vi.fn();
  
  const mockSupabase = {
    rpc: mockRpc,
    from: mockFrom,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);
    mockSingle.mockResolvedValue({ data: { id: 123 }, error: null });
  });

  it('should update prescription successfully', async () => {
    const mockInput = {
      prescription_id: 123,
      patient_id: 456,
      diagnosis: 'Flu',
      notes: 'Rest well',
      prescription_date: '2026-04-26T10:00:00Z',
      items: [
        { medicine_id: 1, medicine_name: 'Med A', packing_spec: '10/box', quantity: 2, unit_price: 5000 }
      ],
    };

    (updatePrescriptionSchema.safeParse as any).mockReturnValue({
      success: true,
      data: mockInput,
    });

    mockRpc.mockResolvedValue({ data: null, error: null });
    const mockUpdatedData = { id: 123, diagnosis: 'Flu' };
    mockSingle.mockResolvedValue({ data: mockUpdatedData, error: null });

    const result = await updatePrescription(mockInput);

    expect(result).toEqual({ success: true, data: mockUpdatedData });
    expect(mockRpc).toHaveBeenCalledWith('update_prescription', expect.objectContaining({
      p_prescription_id: 123,
      p_diagnosis: 'Flu',
    }));
  });

  it('should return error if validation fails', async () => {
    (updatePrescriptionSchema.safeParse as any).mockReturnValue({
      success: false,
      error: {
        issues: [{ path: ['diagnosis'], message: 'Required' }]
      },
    });

    const result = await updatePrescription({} as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Required');
  });

  it('should return error if RPC fails', async () => {
    (updatePrescriptionSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { prescription_id: 1, patient_id: 1, items: [], prescription_date: '', diagnosis: '' },
    });

    mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    const result = await updatePrescription({} as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
