# Phase 02: Infrastructure Alignment & Auth Metadata Deduplication (P1)

**Target Issues:** PERF-003, PERF-004  
**Severity:** 🟠 High (P1)  
**Status:** ✅ Completed  
**Dependencies:** Phase 01  

---

## 1. Objective

Eliminate severe cross-region network latency penalties by aligning Vercel serverless function deployment with the Supabase database hosting region (Seoul `ap-northeast-2` -> `icn1`). Eliminate redundant N+1 database queries on every authenticated server request by reading tenant and role claims directly from JWT `app_metadata` instead of performing repeated queries on the `profiles` table.

---

## 2. Scope

- **In Scope:**
  - Update `vercel.json` to configure Serverless Function execution in region `icn1` (Seoul, South Korea) matching AWS `ap-northeast-2`.
  - Refactor `getAuthUser()` in `src/lib/supabase/auth.ts` to inspect `user.app_metadata?.clinic_id` and `user.app_metadata?.role` (which are populated by Supabase Auth profile triggers) before issuing any database query.
  - Maintain an automatic fallback to the `profiles` table if `app_metadata` is not yet populated (e.g., initial user onboarding or legacy sessions).
  - Implement a comprehensive file-based test verifying region configuration and zero-query authentication context extraction.

- **Out of Scope:**
  - Altering the user authentication flow (login, signup, password reset).
  - Modifying the PostgreSQL trigger `sync_profile_to_auth_metadata` in Supabase (which already synchronizes to `raw_app_meta_data`).

---

## 3. Requirements

### Functional Requirements
- **JWT Claim Resolution:** When an authenticated user's token contains `clinic_id` and `role` within `user.app_metadata`, `getAuthUser()` must resolve and return the user profile with those claims without performing a database lookup against the `profiles` table.
- **Graceful Fallback:** If `clinic_id` or `role` is missing from `user.app_metadata`, `getAuthUser()` must query the `profiles` table to retrieve them, preserving uninterrupted functionality for legacy or partially provisioned users.
- **Contract Preservation:** The shape and TypeScript types returned by `getAuthUser()` (`{ user, profile, clinic_id, role }` or equivalent) must remain strictly compatible with all existing server actions and route handlers.

### Non-Functional & Performance Requirements
- **Regional Colocation:** Serverless execution in Vercel must be routed to `icn1` to eliminate the ~95ms cross-region latency gap between Singapore (`sin1`) and Seoul (`ap-northeast-2`).
- **Zero-DB Overhead for Authenticated Calls:** 100% of standard authenticated requests with valid JWT metadata must execute zero database queries for session and profile resolution.

---

## 4. Constraints

- Must maintain Next.js App Router and `@supabase/ssr` server context compatibility.
- Do not introduce breaking changes to existing route handlers or server actions calling `getAuthUser()`.

---

## 5. Dependencies

- `vercel.json`
- `src/lib/supabase/auth.ts`
- `@supabase/ssr`
- Vitest testing framework

---

## 6. Acceptance Criteria

1. `vercel.json` exists at the project root and includes `"regions": ["icn1"]`.
2. `getAuthUser()` in `src/lib/supabase/auth.ts` checks `user.app_metadata?.clinic_id` and `user.app_metadata?.role`.
3. When `app_metadata` contains clinic and role attributes, no `supabase.from('profiles')` query is issued.
4. When `app_metadata` lacks those attributes, the fallback database query executes and resolves the profile.
5. The comprehensive file-based test in `tests/phase-02-infra-auth.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-02-infra-auth.test.ts`  
**Purpose:** Verify Vercel deployment region configuration and validate that `getAuthUser()` retrieves tenant claims directly from `app_metadata` without querying the `profiles` table.

```typescript
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
```

