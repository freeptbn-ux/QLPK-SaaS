import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientById } from './patients';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase and Next.js cache
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: any) => fn, // disable cache for testing
  };
});

describe('getPatientById Optimization', () => {
  const mockSupabase: any = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });
  });

  it('should fetch patient and prescriptions in parallel and return combined data', async () => {
    const mockPatient = { id: 1, name: 'Test Patient' };
    const mockPrescriptions = [{ id: 101, patient_id: 1 }];
    
    // Mock patient query
    const patientQueryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
    };

    // Mock prescriptions query
    const prescriptionsQueryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockPrescriptions, error: null, count: 1 }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'patients') return patientQueryMock;
      if (table === 'prescriptions_header') return prescriptionsQueryMock;
      return null;
    });

    const result = await getPatientById(1);

    expect(mockSupabase.from).toHaveBeenCalledWith('patients');
    expect(mockSupabase.from).toHaveBeenCalledWith('prescriptions_header');
    
    expect(result).toEqual({
      ...mockPatient,
      prescriptions: mockPrescriptions,
      totalPrescriptions: 1,
    });
  });

  it('should return null if patient is not found', async () => {
    const patientQueryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    const prescriptionsQueryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'patients') return patientQueryMock;
      if (table === 'prescriptions_header') return prescriptionsQueryMock;
      return null;
    });

    const result = await getPatientById(999);
    expect(result).toBeNull();
  });

  it('should handle prescription fetch error gracefully', async () => {
    const mockPatient = { id: 1, name: 'Test Patient' };
    
    const patientQueryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockPatient, error: null }),
    };

    const prescriptionsQueryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch error' }, count: 0 }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'patients') return patientQueryMock;
      if (table === 'prescriptions_header') return prescriptionsQueryMock;
      return null;
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await getPatientById(1);

    expect(result).toEqual({
      ...mockPatient,
      prescriptions: [],
      totalPrescriptions: 0,
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching patient prescriptions'), 'Fetch error');
    consoleSpy.mockRestore();
  });
});
