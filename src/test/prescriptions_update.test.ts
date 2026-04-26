import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePrescription } from '../actions/prescriptions';
import * as supabaseServer from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/validations/helpers', () => ({
  formatZodError: vi.fn((err) => 'Validation Error'),
}));

describe('updatePrescription', () => {
  const mockRpc = vi.fn();
  const mockSupabase = {
    rpc: mockRpc,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);
  });

  it('should return success true when valid data is provided', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    const validData = {
      prescription_id: 1,
      patient_id: 1,
      diagnosis: 'Flu',
      items: [
        { medicine_id: 1, medicine_name: 'Paracetamol', packing_spec: 'Box', quantity: 2, unit_price: 1000 }
      ],
      notes: 'Take after meal',
      prescription_date: new Date().toISOString(),
    };

    const result = await updatePrescription(validData);

    expect(result).toEqual({ success: true });
    expect(mockRpc).toHaveBeenCalledWith('update_prescription', expect.objectContaining({
      p_prescription_id: validData.prescription_id,
      p_diagnosis: validData.diagnosis,
    }));
    expect(revalidatePath).toHaveBeenCalledWith(`/patients/${validData.patient_id}`);
  });

  it('should return validation error when diagnosis is missing', async () => {
    const invalidData = {
      prescription_id: 1,
      patient_id: 1,
      diagnosis: '',
      items: [
        { medicine_id: 1, medicine_name: 'Paracetamol', packing_spec: 'Box', quantity: 2, unit_price: 1000 }
      ],
      prescription_date: new Date().toISOString(),
    } as any;

    const result = await updatePrescription(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation Error');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('should return validation error when items are empty', async () => {
    const invalidData = {
      prescription_id: 1,
      patient_id: 1,
      diagnosis: 'Flu',
      items: [],
      prescription_date: new Date().toISOString(),
    } as any;

    const result = await updatePrescription(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Validation Error');
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('should return error when RPC fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    const validData = {
      prescription_id: 1,
      patient_id: 1,
      diagnosis: 'Flu',
      items: [
        { medicine_id: 1, medicine_name: 'Paracetamol', packing_spec: 'Box', quantity: 2, unit_price: 1000 }
      ],
      prescription_date: new Date().toISOString(),
    };

    const result = await updatePrescription(validData);

    expect(result).toEqual({ success: false, error: 'Database error' });
  });
});
