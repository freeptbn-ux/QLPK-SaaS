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
