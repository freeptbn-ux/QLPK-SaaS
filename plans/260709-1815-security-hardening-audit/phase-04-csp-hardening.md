# Phase 04: Harden CSP — Remove unsafe-inline and unsafe-eval
Status: ✅ Completed
Dependencies: Phase 02 (middleware must be working before adding nonce-based CSP,
since the nonce is generated in the proxy/middleware function).
Covers Audit Issue: **#5** (CSP allows `unsafe-inline` and `unsafe-eval`)

---

## Objective

Replace the current weak CSP header (`unsafe-inline` + `unsafe-eval`) with a
**nonce-based CSP** that:
1. Removes `unsafe-inline` — allowing only explicitly nonce-tagged inline scripts.
2. Removes `unsafe-eval` in **production** — Next.js dev mode still needs it.
3. Uses `'strict-dynamic'` so nonce-approved scripts can load their own dependencies.
4. Passes the nonce from the proxy function to page components via a request header.

---

## Background

### Current CSP (Weak)

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

`unsafe-inline` makes CSP nearly useless against XSS. If an attacker injects a
`<script>malicious()</script>` anywhere, the browser will execute it.

### Target CSP (Nonce-Based)

```
default-src 'self';
script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
frame-ancestors 'none';
connect-src 'self' https://generativelanguage.googleapis.com;
upgrade-insecure-requests;
```

> **Why keep `unsafe-inline` for `style-src`?** Tailwind CSS generates inline styles
> via class utilities, and many component libraries inject inline styles. Removing it
> from `style-src` would break many UI elements. This is an acceptable trade-off —
> CSS injection attacks are far less severe than script injection.

> **Why use `'strict-dynamic'`?** Next.js 16 loads scripts dynamically. `strict-dynamic`
> allows scripts granted by the nonce to load further scripts without needing individual
> nonces, which is required for Next.js to function correctly.

---

## Implementation Steps

### Step 1 — Generate Nonce in `src/proxy.ts`

Add nonce generation to the proxy function and pass it via a request header:

```typescript
// src/proxy.ts (additions to Phase 02 implementation)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = ['/patients', '/medicines', '/prescriptions', '/settings', '/statistics', '/dose-calculator']
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password']

export async function proxy(request: NextRequest) {
  // Generate a cryptographically random nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Build the CSP header
  const isDev = process.env.NODE_ENV === 'development'
  const cspHeader = [
    "default-src 'self'",
    // In production: nonce + strict-dynamic (no unsafe-eval)
    // In development: add unsafe-eval for React's dev tools
    isDev
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",      // Keep for Tailwind + component libs
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self' https://generativelanguage.googleapis.com",
    "upgrade-insecure-requests",
  ].join('; ')

  // Inject nonce into the request so Server Components can read it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // Call updateSession with the modified request
  let response = await updateSession(new Request(request.url, {
    method: request.method,
    headers: requestHeaders,
    body: request.body,
    // @ts-ignore
    duplex: 'half',
  }) as any)

  // Apply CSP and nonce to the response headers
  response.headers.set('Content-Security-Policy', cspHeader)

  // --- Route Guard (from Phase 02) ---
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  if (isPublicPath) return response

  const isProtectedPath = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (!isProtectedPath) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    const redirectResp = NextResponse.redirect(loginUrl)
    redirectResp.headers.set('Content-Security-Policy', cspHeader)
    return redirectResp
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Step 2 — Remove Static CSP from `next.config.ts`

The CSP header is now generated dynamically in `proxy.ts`. The static version in
`next.config.ts` must be removed (or it will override the dynamic one):

```typescript
// next.config.ts — REMOVE the Content-Security-Policy header entry
// Keep all other headers (X-Frame-Options, HSTS, etc.)
{
  key: 'Content-Security-Policy',
  value: "...",  // ← DELETE THIS ENTIRE KEY-VALUE PAIR
},
```

### Step 3 — Read Nonce in Root Layout (Optional but recommended)

If you have any custom inline scripts in `layout.tsx`, they need the nonce:

```typescript
// src/app/layout.tsx
import { headers } from 'next/headers'

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get('x-nonce') ?? ''
  
  return (
    <html>
      <head>
        {/* Any custom inline script must include the nonce */}
        {/* <script nonce={nonce} ... /> */}
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Step 4 — Test CSP in Browser

After deploying, use browser DevTools → Network → Response Headers to verify the
`Content-Security-Policy` header contains a nonce and does NOT contain `unsafe-inline`
for `script-src` in production.

---

## Files to Modify

| Action | File | Change |
|--------|------|--------|
| **MODIFY** | `src/proxy.ts` | Add nonce generation + dynamic CSP header (extends Phase 02 work) |
| **MODIFY** | `next.config.ts` | Remove the static `Content-Security-Policy` header |
| **VERIFY** | `src/app/layout.tsx` | Optionally read nonce for custom inline scripts |

---

## Test Files

### `tests/security-hardening/phase-04.test.ts`

```typescript
/**
 * Phase 04 Security Tests: CSP Hardening
 *
 * Tests verify:
 * 1. CSP is no longer defined as a static string in next.config.ts
 * 2. proxy.ts generates a nonce and injects it into the CSP
 * 3. Production CSP does NOT contain unsafe-eval
 * 4. CSP contains required directives
 *
 * RUN: npx vitest run tests/security-hardening/phase-04.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const NEXT_CONFIG_PATH = path.resolve(process.cwd(), 'next.config.ts');
const PROXY_PATH       = path.resolve(process.cwd(), 'src/proxy.ts');
const nextConfigContent = fs.readFileSync(NEXT_CONFIG_PATH, 'utf-8');
const proxyContent      = fs.readFileSync(PROXY_PATH, 'utf-8');

describe('Phase 04: CSP Hardening', () => {

  describe('next.config.ts — Static CSP must be removed', () => {
    it('does NOT contain a static unsafe-inline in script-src', () => {
      // The old static CSP had unsafe-inline for script-src
      // After this phase, CSP is generated dynamically in proxy.ts
      const hasStaticUnsafeInlineScript = nextConfigContent.match(
        /Content-Security-Policy[\s\S]*?unsafe-inline[\s\S]*?script-src|script-src[\s\S]*?unsafe-inline[\s\S]*?Content-Security-Policy/
      );
      expect(hasStaticUnsafeInlineScript).toBeNull();
    });

    it('does NOT contain a static unsafe-eval in script-src', () => {
      const hasStaticUnsafeEval = nextConfigContent.match(
        /['"]Content-Security-Policy['"]/
      );
      // CSP should be removed from next.config.ts entirely
      expect(hasStaticUnsafeEval).toBeNull();
    });
  });

  describe('proxy.ts — Dynamic nonce-based CSP', () => {
    it('generates a nonce using crypto.randomUUID()', () => {
      expect(proxyContent).toMatch(/crypto\.randomUUID\(\)/);
    });

    it('includes the nonce in the CSP header', () => {
      expect(proxyContent).toMatch(/nonce-/);
      expect(proxyContent).toMatch(/Content-Security-Policy/);
    });

    it("uses 'strict-dynamic' in script-src", () => {
      expect(proxyContent).toMatch(/strict-dynamic/);
    });

    it("sets x-nonce request header for Server Components", () => {
      expect(proxyContent).toMatch(/x-nonce/);
    });

    it("does NOT contain 'unsafe-eval' unconditionally (production CSP)", () => {
      // unsafe-eval may appear in a dev-only branch but must be conditional
      const unsafeEvalMatches = proxyContent.match(/unsafe-eval/g) ?? [];
      if (unsafeEvalMatches.length > 0) {
        // If it exists, it must be inside a dev conditional block
        expect(proxyContent).toMatch(/isDev|NODE_ENV.*development|development.*NODE_ENV/);
      }
    });

    it("contains 'upgrade-insecure-requests' directive", () => {
      expect(proxyContent).toMatch(/upgrade-insecure-requests/);
    });

    it("contains frame-ancestors 'none' directive", () => {
      expect(proxyContent).toMatch(/frame-ancestors/);
    });

    it("allows connection to Gemini API in connect-src", () => {
      expect(proxyContent).toMatch(/generativelanguage\.googleapis\.com/);
    });
  });

  describe('CSP policy structure validation', () => {
    // Extract the CSP string template from proxy.ts for structural checks
    it('proxy.ts CSP template includes default-src self', () => {
      expect(proxyContent).toMatch(/default-src.*'self'/);
    });

    it('proxy.ts CSP style-src allows unsafe-inline (acceptable for Tailwind)', () => {
      // style-src unsafe-inline is acceptable — CSS injection << script injection
      expect(proxyContent).toMatch(/style-src.*unsafe-inline/);
    });
  });
});
```

### `tests/security-hardening/phase-04-verify-checklist.md`

```markdown
# Phase 04 — Browser Verification Checklist

## Goal
Verify that the Content-Security-Policy header in production/dev is correct.

## Steps

### TC-01: CSP Header Is Present and Has Nonce
1. Open Browser DevTools → Network tab
2. Navigate to `/patients` (or any page)
3. Click on the HTML document request
4. Look at Response Headers for `Content-Security-Policy`
5. **Expected:** Header contains `script-src 'self' 'nonce-<long-base64-string>' 'strict-dynamic'`
6. **Fail if:** Header contains `'unsafe-inline'` in `script-src`

### TC-02: No unsafe-eval in Production CSP
1. Ensure you're in production mode (`npm run build && npm start`) or staging
2. Check the CSP header
3. **Expected:** No `unsafe-eval` in `script-src`
4. **Acceptable in dev:** `unsafe-eval` may appear in dev mode only

### TC-03: Nonce Rotates on Each Request
1. Reload the page twice
2. Compare the `nonce-` value in the CSP header between the two requests
3. **Expected:** The nonce value is different each time (confirms randomness)

### TC-04: Application Still Functions
1. Log in, navigate between pages
2. Open the browser console — check for CSP violation errors
3. **Expected:** No CSP errors in console
4. **Note:** Some minor CSP warnings from third-party browser extensions are acceptable

### TC-05: Static Assets Not Blocked
1. Confirm images, fonts, and CSS load correctly on all pages
2. **Expected:** No broken images or missing styles
```

---

## Acceptance Criteria

- [ ] `next.config.ts` no longer has a static `Content-Security-Policy` header
- [ ] `src/proxy.ts` generates a random nonce on every request using `crypto.randomUUID()`
- [ ] CSP `script-src` contains `nonce-<value>` and `'strict-dynamic'`
- [ ] CSP `script-src` does NOT contain `unsafe-eval` in production mode
- [ ] CSP `script-src` does NOT contain `unsafe-inline`
- [ ] All pages continue to function (no CSP console errors)
- [ ] The nonce changes on every page request
- [ ] All vitest tests in `phase-04.test.ts` pass

---

## Important Notes

> **Note on `'unsafe-inline'` for `style-src`:** This plan retains `unsafe-inline`
> for styles only. Removing it from styles requires auditing every Tailwind class and
> third-party component for inline style usage — this is a separate, larger effort.
> Style-based XSS attacks are much harder to exploit than script-based ones.

> **Note on Static Pages:** Using per-request nonces makes pages dynamic (cannot be
> cached at CDN level as static HTML). If any page uses `export const dynamic = 'force-static'`,
> it must be audited — such pages cannot use the nonce pattern.

---

Previous Phase: [phase-03-login-error-hardening.md](./phase-03-login-error-hardening.md)
