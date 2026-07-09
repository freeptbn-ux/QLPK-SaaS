# Phase 02: Fix Next.js Middleware — Proxy Function Activation
Status: ✅ Completed
Dependencies: Phase 01 (recommended, but can be applied independently)
Covers Audit Issue: **#3** (Middleware not recognized by Next.js)

---

## Objective

Make Next.js 16 correctly recognize and execute the middleware file so that:
1. **Session tokens are refreshed** on every request (preventing unexpected logouts).
2. **Unauthenticated users are redirected** to `/login` when they attempt to access
   protected routes like `/patients`, `/medicines`, `/prescriptions`, etc.

---

## Background & Analysis

### Current State (Broken)

The file `src/proxy.ts` currently exports a function named `proxy`:

```typescript
// src/proxy.ts  ← This name is CORRECT for Next.js 16
export async function proxy(request: NextRequest) {   // ← CORRECT export name
  return await updateSession(request)
}
```

**Wait — the filename AND export are already correct for Next.js 16.**

Research confirms: In **Next.js 16+**, the convention changed from `middleware.ts`
(export `middleware`) to `proxy.ts` (export `proxy`). The existing `src/proxy.ts`
follows this correctly.

### Why Is Middleware Not Running Then?

The issue is **not the function name** — it is that the `updateSession` implementation
in `src/lib/supabase/proxy.ts` likely does not redirect unauthenticated users. It only
refreshes the session cookie. Route protection (redirect) logic is missing.

We need to verify: does `updateSession` redirect to `/login` for protected routes, or
does it only silently refresh the token?

### What Needs To Be Added

The middleware must:
1. **Continue** to call `updateSession` (for token refresh — already done ✅).
2. **Check** if the request path is a protected route.
3. **Redirect** to `/login` if the session is absent or expired.

This "check and redirect" logic is currently absent.

---

## Implementation Steps

### Step 1 — Inspect the current `updateSession` implementation

Read `src/lib/supabase/proxy.ts` to understand what it does.

### Step 2 — Extend `src/proxy.ts` with route guard logic

Update `src/proxy.ts` to add authenticated route protection:

```typescript
// src/proxy.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'

// Protected routes: any path that requires authentication
const PROTECTED_PREFIXES = [
  '/patients',
  '/medicines',
  '/prescriptions',
  '/settings',
  '/statistics',
  '/dose-calculator',
]

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  // Step 1: Refresh the session cookie (existing logic)
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Step 2: Skip auth check for public paths and Next.js internals
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  if (isPublicPath) return response

  // Step 3: Check if the route is protected
  const isProtectedPath = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtectedPath) return response

  // Step 4: Verify session — create a temporary client to read the cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {}, // read-only in middleware context
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login, preserving the intended destination
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 3 — Check `src/lib/supabase/proxy.ts`

Verify that `updateSession` correctly handles cookies using `response.cookies.setAll`.
If it uses the old `cookies().set` pattern (which was removed in Next.js 16), fix it.

Expected correct implementation:
```typescript
// src/lib/supabase/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must call getUser() here, not getSession()
  await supabase.auth.getUser()

  return supabaseResponse
}
```

### Step 4 — Verify that protected pages also have server-side auth guards

> **Defense in depth:** Middleware is the first layer. Each protected page/layout must
> also call `getAuthUser()` server-side. Verify that `src/app/(protected)/layout.tsx`
> (or equivalent) performs an auth check and redirects if needed.

---

## Files to Modify

| Action | File | Purpose |
|--------|------|---------|
| **MODIFY** | `src/proxy.ts` | Add route guard logic (redirect unauthenticated users) |
| **VERIFY** | `src/lib/supabase/proxy.ts` | Ensure `updateSession` uses correct cookie API |
| **VERIFY** | `src/app/` layout files | Confirm server-side auth guards exist as second layer |

---

## Test Files

### `tests/security-hardening/phase-02-verify-checklist.md`
Manual verification checklist for the middleware behavior.

```markdown
# Phase 02 — Manual Verification Checklist

## Pre-conditions
- [ ] Dev server is running: `npm run dev`
- [ ] You are NOT logged in (clear cookies or use incognito)

## Test Cases

### TC-01: Unauthenticated access to protected route
1. Open incognito browser window
2. Navigate to `http://localhost:3000/patients`
3. **Expected:** Redirected to `/login?redirectTo=/patients`
4. **Fail if:** The patients page loads (even partially) without login

### TC-02: Unauthenticated access to medicines route
1. Navigate to `http://localhost:3000/medicines`
2. **Expected:** Redirected to `/login`
3. **Fail if:** Medicines page loads

### TC-03: Login page is accessible without auth
1. Navigate to `http://localhost:3000/login`
2. **Expected:** Login page renders normally
3. **Fail if:** Redirected again or 500 error

### TC-04: After login, redirect to original destination
1. Navigate to `/patients` while logged out
2. You are redirected to `/login?redirectTo=/patients`
3. Log in with valid credentials
4. **Expected:** After login, you land on `/patients`

### TC-05: Authenticated user can access protected routes
1. Log in with valid credentials
2. Navigate to `/patients`, `/medicines`, `/settings`
3. **Expected:** All pages load normally

### TC-06: Session cookie refresh
1. Log in and stay on a page for > 1 minute
2. Perform an action (navigate to another protected page)
3. **Expected:** No unexpected logout; session remains active
```

### `tests/security-hardening/phase-02.test.ts`
Vitest tests for middleware configuration validation (static analysis — no live server needed).

```typescript
/**
 * Phase 02 Security Tests: Middleware Configuration
 *
 * These tests verify:
 * 1. proxy.ts exports the correct function name 'proxy' (Next.js 16 convention)
 * 2. The config.matcher is defined
 * 3. The proxy function implements route guard logic for protected paths
 *
 * RUN: npx vitest run tests/security-hardening/phase-02.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PROXY_FILE = path.resolve(process.cwd(), 'src/proxy.ts');
const proxyContent = fs.readFileSync(PROXY_FILE, 'utf-8');

describe('Phase 02: Middleware (proxy.ts) Configuration', () => {

  it('proxy.ts file exists', () => {
    expect(fs.existsSync(PROXY_FILE)).toBe(true);
  });

  it('exports function named "proxy" (Next.js 16 convention)', () => {
    expect(proxyContent).toMatch(/export\s+async\s+function\s+proxy\s*\(/);
  });

  it('does NOT export a function named "middleware" (old convention — would be ignored)', () => {
    expect(proxyContent).not.toMatch(/export\s+(async\s+)?function\s+middleware\s*\(/);
  });

  it('exports config with matcher', () => {
    expect(proxyContent).toMatch(/export\s+const\s+config\s*=/);
    expect(proxyContent).toMatch(/matcher/);
  });

  it('calls updateSession for token refresh', () => {
    expect(proxyContent).toMatch(/updateSession/);
  });

  it('imports NextResponse for redirect capability', () => {
    expect(proxyContent).toMatch(/NextResponse/);
  });

  it('has protected path check logic', () => {
    // Should contain route guard logic referencing protected routes
    const hasPatients = proxyContent.includes('/patients');
    const hasMedicines = proxyContent.includes('/medicines');
    expect(hasPatients).toBe(true);
    expect(hasMedicines).toBe(true);
  });

  it('redirects to /login when unauthenticated (has redirect logic)', () => {
    expect(proxyContent).toMatch(/\/login/);
    expect(proxyContent).toMatch(/redirect/i);
  });

  describe('src/lib/supabase/proxy.ts — updateSession implementation', () => {
    const LIB_PROXY = path.resolve(process.cwd(), 'src/lib/supabase/proxy.ts');
    const libContent = fs.readFileSync(LIB_PROXY, 'utf-8');

    it('updateSession file exists', () => {
      expect(fs.existsSync(LIB_PROXY)).toBe(true);
    });

    it('uses getAll/setAll cookie pattern (Next.js 16 compatible)', () => {
      expect(libContent).toMatch(/getAll/);
      expect(libContent).toMatch(/setAll/);
    });

    it('does NOT use deprecated cookies().set() pattern', () => {
      // Old pattern that was removed in Next.js 16
      expect(libContent).not.toMatch(/cookies\(\)\.set\(/);
    });
  });
});
```

---

## Acceptance Criteria

- [ ] Navigating to `/patients` while unauthenticated redirects to `/login`
- [ ] Navigating to `/medicines` while unauthenticated redirects to `/login`
- [ ] Login page loads without redirect loops
- [ ] Authenticated users can still access all protected routes
- [ ] `proxy.ts` exports `function proxy` (not `function middleware`)
- [ ] All vitest tests in `phase-02.test.ts` pass

---

Previous Phase: [phase-01-rls-and-anon-revoke.md](./phase-01-rls-and-anon-revoke.md)
Next Phase: [phase-03-login-error-hardening.md](./phase-03-login-error-hardening.md)
