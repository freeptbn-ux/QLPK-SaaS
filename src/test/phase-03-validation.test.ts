import { describe, it, expect, vi, beforeEach } from 'vitest';
import { removeDiacritics } from '@/lib/utils/normalize';
import { searchPatients } from '@/actions/patients';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock Next.js headers/cache
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Phase 03: Validation - Search & Normalization', () => {
  describe('removeDiacritics', () => {
    it('should correctly remove diacritics from various Vietnamese strings', () => {
      const cases = [
        { input: 'Nguyễn Văn A', expected: 'nguyen van a' },
        { input: 'Trần Thị Bưởi', expected: 'tran thi buoi' },
        { input: 'Lê Công Định', expected: 'le cong dinh' },
        { input: 'Đặng Ngọc Hùng', expected: 'dang ngoc hung' },
        { input: 'PHẠM MINH CHÍNH', expected: 'pham minh chinh' },
        { input: '123 Phone', expected: '123 phone' },
        { input: '', expected: '' },
      ];

      cases.forEach(({ input, expected }) => {
        expect(removeDiacritics(input)).toBe(expected);
      });
    });

    it('should handle special Vietnamese characters like Đ and đ', () => {
      expect(removeDiacritics('Đồng Nai')).toBe('dong nai');
      expect(removeDiacritics('đường xá')).toBe('duong xa');
    });
  });

  describe('searchPatients logic', () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      rpc: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
      (createClient as any).mockResolvedValue(mockSupabase);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
    });

    it('should call RPC with both original and normalized search terms', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const term = 'Nguyễn';
      await searchPatients(term, 1, 10);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', {
        p_search_term: 'Nguyễn',
        p_search_normalized: 'nguyen',
        p_limit: 10,
        p_offset: 0,
      });
    });

    it('should search by phone number correctly', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const term = '0901234567';
      await searchPatients(term, 1, 10);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patients_with_last_visit', {
        p_search_term: '0901234567',
        p_search_normalized: '0901234567',
        p_limit: 10,
        p_offset: 0,
      });
    });
  });
});
