# Phase 03: Fix Login Error Leakage + Server-Side Password Validation
Status: ✅ Completed
Dependencies: Phase 01 and 02 should be applied first, but this is independent.
Covers Audit Issues: **#4** (Login leaks Supabase raw error messages), **#5 partial** (Server-side password validation)

---

## Objective

1. **Stop leaking Supabase error message strings** to the client from `loginAction` —
   replace with a generic, non-enumerable message to prevent user enumeration attacks.
2. **Add server-side password strength validation** to `changePassword` so it cannot
   be bypassed by calling the server action directly.
3. **Document rate limiting posture** — Supabase Auth already has built-in rate limiting
   (~30 requests/hour by default). We will add an application-level in-memory guard
   as an additional layer using a simple `Map` cache (no Redis dependency needed
   for Phase 1 hardening).

---

## Background

### Issue: User Enumeration via Login Error Messages

Current code in `src/actions/auth.ts`:
```typescript
if (error) {
  return { error: error.message }  // ← returns Supabase raw message
}
```

Supabase Auth returns different messages depending on the failure reason:
- `"Invalid login credentials"` → email exists, wrong password
- `"Email not confirmed"` → email exists, but not verified
- `"User not found"` → email doesn't exist

An attacker can use this to identify which emails are registered in the system.

### Fix: Always return a generic message
```typescript
if (error) {
  return { error: 'Email hoặc mật khẩu không chính xác.' }
}
```

### Issue: No Server-Side Password Validation

`changePassword()` in `src/actions/settings.ts` accepts any `newPassword` string and
calls `supabase.auth.updateUser` without validating length or complexity. A direct
POST to the server action endpoint can set an empty or 1-character password.

### Fix: Add validation before calling Supabase

```typescript
export async function changePassword(currentPassword: string, newPassword: string) {
  // Server-side validation — cannot be bypassed by client
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự')
  }
  // ... existing code
}
```

### In-Memory Rate Limiting for Login

A simple `Map<email, { count, firstAttempt }>` stored at module level provides
per-email rate limiting within a single server instance. For multi-instance deployments,
Redis would be needed, but for Phase 1 hardening this provides meaningful protection.

Window: 15 minutes, max 10 attempts.

---

## Implementation Steps

### Step 1 — Fix `src/actions/auth.ts`

Replace raw Supabase error message with generic message + add simple rate limiting:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// In-memory rate limiter: Map<normalizedEmail, { count, windowStart }>
// Cleared when the server process restarts. For multi-instance, use Redis.
const loginAttempts = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10

function checkRateLimit(email: string): { blocked: boolean; remainingMs?: number } {
  const key = email.toLowerCase().trim()
  const now = Date.now()
  const record = loginAttempts.get(key)

  if (!record || (now - record.windowStart) > RATE_LIMIT_WINDOW_MS) {
    // Fresh window
    loginAttempts.set(key, { count: 1, windowStart: now })
    return { blocked: false }
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - record.windowStart)
    return { blocked: true, remainingMs }
  }

  record.count++
  return { blocked: false }
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  // Rate limit check
  const rateCheck = checkRateLimit(email)
  if (rateCheck.blocked) {
    const minutes = Math.ceil((rateCheck.remainingMs ?? 0) / 60000)
    return { error: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${minutes} phút.` }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // SECURITY: Do NOT return the raw Supabase error message.
    // Raw messages like "Email not confirmed" or "Invalid login credentials"
    // allow attackers to enumerate valid email addresses.
    return { error: 'Email hoặc mật khẩu không chính xác.' }
  }

  // On success, clear the rate limit for this email
  loginAttempts.delete(email.toLowerCase().trim())

  revalidatePath('/', 'layout')
  redirect('/patients')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

### Step 2 — Fix `src/actions/settings.ts` — `changePassword`

Add server-side validation before the Supabase call:

```typescript
export async function changePassword(currentPassword: string, newPassword: string) {
  // Server-side validation (client-side can be bypassed)
  if (!newPassword || newPassword.trim().length < 8) {
    throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự')
  }
  if (newPassword === currentPassword) {
    throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại')
  }

  const { user, supabase } = await getAuthUser()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    throw new Error('Mật khẩu hiện tại không chính xác')
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    throw new Error(getGenericErrorMessage(error))
  }
}
```

---

## Files to Modify

| Action | File | Change |
|--------|------|--------|
| **MODIFY** | `src/actions/auth.ts` | Generic error message + in-memory rate limiter |
| **MODIFY** | `src/actions/settings.ts` | Server-side password length validation |

---

## Test Files

### `tests/security-hardening/phase-03.test.ts`

```typescript
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
```

---

## Acceptance Criteria

- [ ] `loginAction` never returns the raw Supabase error string
- [ ] `loginAction` returns the same generic message regardless of whether the email exists or not
- [ ] `loginAction` blocks further attempts after 10 failures within 15 minutes
- [ ] `changePassword` throws if `newPassword` is empty or < 8 chars (server-side)
- [ ] `changePassword` throws if `newPassword === currentPassword`
- [ ] All vitest tests in `phase-03.test.ts` pass

---

Previous Phase: [phase-02-middleware.md](./phase-02-middleware.md)
Next Phase: [phase-04-csp-hardening.md](./phase-04-csp-hardening.md)
