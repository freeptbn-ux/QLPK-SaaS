// @vitest-environment node
// tests/verify-medicine-usage-rpc.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMedicineUsageByPatient } from '../src/actions/patients';
import { getAuthUser } from '../src/lib/supabase/auth';

vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Medicine Usage RPC Integration', () => {
  const mockSupabase: any = {
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthUser as any).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      supabase: mockSupabase 
    });
  });

  it('should call get_medicine_usage_by_patient database RPC and return parsed data', async () => {
    const mockOutput = [
      { medicine_id: 1, medicine_name: 'Paracetamol', packing_spec: 'Vỉ', times_prescribed: 5 }
    ];
    mockSupabase.rpc.mockResolvedValue({ data: mockOutput, error: null });

    const result = await getMedicineUsageByPatient(123);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_medicine_usage_by_patient', {
      p_patient_id: 123
    });
    expect(result).toEqual(mockOutput);
  });

  it('should return empty array and log error on RPC failure', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: new Error('Database Error') });

    const result = await getMedicineUsageByPatient(123);

    expect(result).toEqual([]);
  });
});
