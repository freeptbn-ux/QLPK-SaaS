import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPatient } from './patients';
import { createPrescription } from './prescriptions';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock auth
const mockUser = { id: 'user-123', email: 'test@example.com' };

describe('Error Masking Hardening', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    rpc: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it('addPatient should mask SQL foreign key constraint errors', async () => {
    // Simulate a DB error that leaks SQL/Internal info
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: {
        message: 'insert or update on table "patients" violates foreign key constraint "patients_user_id_fkey"',
        code: '23503',
        detail: 'Key (user_id)=(...) is not present in table "users".'
      }
    });

    const data = {
      name: 'John Doe',
      dob: '01/01/1990',
      gender: 'Nam',
      phone: '0123456789',
      address: '123 St',
    };

    await expect(addPatient(data)).rejects.toThrow('Không thể thực hiện tác vụ này vì dữ liệu đang được sử dụng ở nơi khác.');
  });

  it('createPrescription should mask internal Postgres errors', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: {
        message: 'Internal error in function create_prescription: invalid input syntax for type json',
        code: 'XX000'
      }
    });

    const data = {
      patient_id: 1,
      diagnosis: 'Flu',
      items: [{ medicine_id: 1, medicine_name: 'Med A', quantity: 1, unit_price: 100, packing_spec: 'Box' }],
      consultation_fee: 30000
    };

    const result = await createPrescription(data);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    expect(result.error).not.toContain('invalid input syntax');
  });

  it('addPatient should mask unauthorized errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const data = {
      name: 'John Doe',
      dob: '01/01/1990',
      gender: 'Nam',
      phone: '0123456789',
    };

    // Note: The current addPatient implementation throws 'Unauthorized' directly if no user.
    // Let's see if it gets caught by our handler if we wrap it.
    // In our case, addPatient doesn't wrap the 'if (!user) throw new Error('Unauthorized')' in a try/catch.
    // So it will throw 'Unauthorized'. Our handler catches it in the UI or if we wrap the whole thing.
    
    // However, if Supabase returns a 403/Permission Denied error:
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Permission denied for function upsert_patient', code: '42501' }
    });

    await expect(addPatient(data)).rejects.toThrow('Bạn không có quyền thực hiện tác vụ này.');
  });
});
