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
