// tests/verify-patient-list-optimization.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientsPaginated, searchPatients } from '../src/actions/patients';
import { getAuthUser } from '../src/lib/supabase/auth';

vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Patient List Last Visit Optimization', () => {
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

  it('should request patients list via get_patients_with_last_visit RPC in getPatientsPaginated', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await getPatientsPaginated(1, 10);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', expect.objectContaining({
      p_limit: 10,
      p_offset: 0
    }));
  });

  it('should use search terms in searchPatients with get_patients_with_last_visit RPC', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await searchPatients('John', 1, 10);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', expect.objectContaining({
      p_search_term: 'John',
      p_search_normalized: 'john'
    }));
  });
});
