# Phase 01: Vercel-Supabase Performance & Auth Deduplication

**Status:** ✅ Completed  
**Dependencies:** None  

---

## 1. Objective

Optimize edge and serverless communication latency between Vercel and Supabase by eliminating redundant network round-trips caused by multiple `supabase.auth.getUser()` invocations during HTTP request handling, and aligning Vercel serverless execution regions with the Supabase deployment region.

---

## 2. Scope

- **In Scope:**
  - Audit and consolidate session refresh and route protection logic in `src/proxy.ts` and `src/lib/supabase/proxy.ts` so that `supabase.auth.getUser()` is called at most once per incoming HTTP request.
  - Preserve all existing Content Security Policy (CSP), nonce generation, and redirection behavior for protected routes (`/patients`, `/medicines`, `/prescriptions`, `/settings`, `/statistics`, `/dose-calculator`) and public routes (`/login`, `/signup`, `/forgot-password`).
  - Create and configure `vercel.json` to explicitly set Serverless Function execution to the target region (`sin1` - Singapore / `ap-southeast-1`).
  - Create a dedicated file-based test suite verifying that session update, route guard redirection, and header propagation work with single auth client invocation.

- **Out of Scope:**
  - Changes to individual database RPCs or server action business logic.
  - Changes to public marketing pages or static assets.

---

## 3. Requirements

### Functional Requirements
- Unauthenticated requests targeting protected paths must be redirected to `/login?redirectTo=<target_path>` with CSP headers intact.
- Authenticated requests visiting `/login` or `/` must be redirected to `/patients`.
- Authenticated requests visiting protected routes must proceed with updated session cookies and injected nonce headers (`x-nonce`, `Content-Security-Policy`).
- Requests to public paths (`/login`, `/signup`, `/forgot-password`) must proceed without enforcing authentication.

### Non-Functional Requirements (Performance & Security)
- Exactly one `supabase.auth.getUser()` call must occur across the middleware proxy pipeline for any single incoming request.
- CSP headers containing the request nonce and allowed connect origins must be preserved on all responses, including redirects.
- Serverless functions on Vercel must run in `sin1` to minimize round-trip latency to the database.

---

## 4. Constraints

- Must comply with Next.js App Router and `@supabase/ssr` contract for cookie reading and setting in Edge/Node runtime.
- Do not introduce breaking changes to existing test suite in `src/test/middleware-security.test.ts`.

---

## 5. Dependencies

- `@supabase/ssr` (installed)
- `next/server` (installed)
- Vitest testing environment (configured in `vitest.config.mts`)

---

## 6. Acceptance Criteria

1. `src/proxy.ts` executes a single auth check flow per request instead of calling `supabase.auth.getUser()` once inside `updateSession` and once downstream in `proxy()`.
2. A valid `vercel.json` exists in project root with `"regions": ["sin1"]`.
3. Vitest passes for the dedicated middleware performance & security test.
4. Existing security tests in `src/test/middleware-security.test.ts` pass without regression.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/middleware-perf-auth.test.ts`  
**Purpose:** Verify that incoming requests to protected and public routes trigger exactly one `getUser()` call, correctly handle unauthenticated redirection with redirect query parameters, and maintain CSP headers.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';
import { createServerClient } from '@supabase/ssr';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  const next = vi.fn((opts) => ({
    headers: new Headers(opts?.headers || {}),
    cookies: {
      set: vi.fn(),
      getAll: vi.fn(() => []),
    },
    ...opts,
  }));
  const redirect = vi.fn((url) => ({
    status: 302,
    headers: new Headers({ location: url.toString() }),
    url: url.toString(),
  }));
  return {
    ...actual,
    NextResponse: {
      next,
      redirect,
    },
  };
});

describe('Phase 01 Test: Middleware Auth Performance & Single Round-Trip', () => {
  let getUserMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    getUserMock = vi.fn();
    (createServerClient as any).mockReturnValue({
      auth: {
        getUser: getUserMock,
      },
    });
  });

  it('calls getUser at most once for protected route and redirects unauthenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/patients'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/login?redirectTo=%2Fpatients');
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
  });

  it('calls getUser at most once for authenticated user on protected route', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/prescriptions'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
  });

  it('redirects authenticated user visiting /login to /patients with single getUser call', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const req = new NextRequest(new URL('http://localhost:3000/login'));
    const res = await proxy(req);

    expect(getUserMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('/patients');
  });
});
```

