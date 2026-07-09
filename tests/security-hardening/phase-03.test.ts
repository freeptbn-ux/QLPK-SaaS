/**
 * Phase 03 Security Tests: Login Error Hardening + Password Validation
 *
 * RUN: npx vitest run tests/security-hardening/phase-03.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction } from '@/actions/auth';
import { changePassword } from '@/actions/settings';

// ─── Mock Supabase client ────────────────────────────────────────────────────
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Phase 03: Login Error Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginAction — error message must be generic', () => {
    it('returns generic message when credentials are wrong', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as any).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            error: { message: 'Invalid login credentials' },
          }),
        },
      });

      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'wrongpassword');

      const result = await loginAction(formData);

      expect(result?.error).toBeDefined();
      // Must NOT leak Supabase's raw error message
      expect(result?.error).not.toContain('Invalid login credentials');
      expect(result?.error).not.toContain('credentials');
      // Should be the safe generic message
      expect(result?.error).toMatch(/Email|mật khẩu|không chính xác/i);
    });

    it('returns generic message when email is not confirmed (not "Email not confirmed")', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as any).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            error: { message: 'Email not confirmed' },
          }),
        },
      });

      const formData = new FormData();
      formData.set('email', 'unconfirmed@example.com');
      formData.set('password', 'anypassword');

      const result = await loginAction(formData);

      expect(result?.error).not.toContain('confirmed');
      expect(result?.error).not.toContain('Email not confirmed');
    });

    it('returns generic message when user is not found (prevents enumeration)', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as any).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            error: { message: 'User not found' },
          }),
        },
      });

      const formData = new FormData();
      formData.set('email', 'nonexistent@example.com');
      formData.set('password', 'anypassword');

      const result = await loginAction(formData);

      expect(result?.error).not.toContain('not found');
      expect(result?.error).not.toContain('User not found');
    });
  });

  describe('loginAction — rate limiting', () => {
    it('blocks login after 10 failed attempts', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as any).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            error: { message: 'Invalid login credentials' },
          }),
        },
      });

      const email = `ratetest_${Date.now()}@example.com`;
      const formData = new FormData();
      formData.set('email', email);
      formData.set('password', 'wrong');

      let lastResult: any;
      // Attempt 11 times — the 11th should be rate-limited
      for (let i = 0; i < 11; i++) {
        lastResult = await loginAction(formData);
      }

      expect(lastResult?.error).toMatch(/phút|rate limit|quá nhiều/i);
    });
  });
});

describe('Phase 03: Server-Side Password Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects empty newPassword', async () => {
    await expect(changePassword('currentPass123', '')).rejects.toThrow(/8 ký tự|ít nhất/i);
  });

  it('rejects newPassword shorter than 8 characters', async () => {
    await expect(changePassword('currentPass123', '1234567')).rejects.toThrow(/8 ký tự|ít nhất/i);
  });

  it('rejects newPassword identical to currentPassword', async () => {
    await expect(changePassword('SamePass123', 'SamePass123')).rejects.toThrow(/khác/i);
  });

  it('accepts newPassword with 8+ characters when auth succeeds', async () => {
    const { getAuthUser } = await import('@/lib/supabase/auth');
    (getAuthUser as any).mockResolvedValue({
      user: { email: 'user@example.com' },
      supabase: {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
          updateUser: vi.fn().mockResolvedValue({ error: null }),
        },
      },
    });

    // Should not throw
    await expect(changePassword('currentPass123', 'newStrongPass!1')).resolves.toBeUndefined();
  });
});
