import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mocks for Supabase client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect.mockReturnValue({
    eq: mockEq.mockReturnValue({
      single: mockSingle,
    }),
  }),
}));

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe('Phase 02: Infrastructure Alignment & Auth Metadata Deduplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement PERF-003: vercel.json must configure serverless functions in icn1 (Seoul)', () => {
    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    expect(fs.existsSync(vercelConfigPath)).toBe(true);

    const configContent = fs.readFileSync(vercelConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(config.regions).toBeDefined();
    expect(config.regions).toContain('icn1');
  });

  it('Requirement PERF-004: getAuthUser must extract clinic_id from app_metadata WITHOUT querying profiles', async () => {
    const { getAuthUser } = await import('@/lib/supabase/auth');

    // Mock authenticated user containing app_metadata claims
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-uuid-123',
          email: 'doctor@clinic.com',
          app_metadata: {
            clinic_id: 'clinic-uuid-456',
            role: 'doctor',
          },
          user_metadata: {
            full_name: 'Dr. Nguyen',
          },
        },
      },
      error: null,
    });

    const result = await getAuthUser();

    expect(result).toBeDefined();
    expect(result?.user?.id).toBe('user-uuid-123');
    expect(result?.clinic_id).toBe('clinic-uuid-456');
    expect(result?.role).toBe('doctor');

    // Crucial check: profiles table must NOT be queried
    expect(mockFrom).not.toHaveBeenCalledWith('profiles');
  });

  it('Requirement PERF-004: getAuthUser must fallback to profiles query if app_metadata is missing claims', async () => {
    const { getAuthUser } = await import('@/lib/supabase/auth');

    // Mock authenticated user lacking app_metadata claims (legacy token)
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-legacy-789',
          email: 'legacy@clinic.com',
          app_metadata: {},
          user_metadata: {},
        },
      },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: {
        clinic_id: 'fallback-clinic-999',
        role: 'admin',
        full_name: 'Admin Fallback',
      },
      error: null,
    });

    const result = await getAuthUser();

    expect(result).toBeDefined();
    expect(result?.clinic_id).toBe('fallback-clinic-999');
    expect(result?.role).toBe('admin');

    // Profiles table MUST be queried as fallback
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });
});

