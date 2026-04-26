# Security Analysis Report

## 1. Summary
- The codebase has several strong practices (server-side Supabase client usage, schema validation in many paths, generic user-facing error messages in most CRUD flows).
- However, the current security posture is weakened by database authorization design and operationally dangerous admin capabilities exposed through application actions.
- The most severe risks are:
  - Over-permissive RLS policies and broad RPC execution grants.
  - `SECURITY DEFINER` RPCs that can be executed by `anon` in multiple migrations.
  - A migration runner action callable from the Settings UI that executes all SQL files against production DB credentials.
  - Sensitive medical/PII data snapshots present in workspace SQL dump files.

## 2. Critical Vulnerabilities

### 2.1 Global RPC execute grants + SECURITY DEFINER usage
- Description:
  - Multiple migrations grant execute to all functions in `public` for `anon` and `authenticated`.
  - Several write-impact RPCs are `SECURITY DEFINER` (run with function owner privileges).
  - Evidence:
    - `supabase/migrations/011_grant_rpc_permissions.sql:6`
    - `supabase/migrations/002_create_prescription_rpc.sql:119`
    - `supabase/migrations/006_merge_patients_rpc.sql:53`
    - `supabase/migrations/008_statistics_rpcs.sql:179`
    - `supabase/migrations/010_monthly_revenue_rpc.sql:14`
    - `supabase/migrations/20260426112520_security_concurrency.sql:118`
    - `supabase/migrations/002_create_prescription_rpc.sql:61`
    - `supabase/migrations/20260426163000_add_update_prescription_rpc.sql:95`
    - `supabase/migrations/20260426155000_add_delete_prescription_rpc.sql:39`
- Exploitation scenario:
  - An unauthenticated attacker (holding only public anon key) can invoke exposed RPC endpoints if executable by `anon`, and mutate prescriptions/patients/stock through definer functions depending on function logic.
- Fix / mitigation:
  - Revoke blanket grants immediately:
    - `REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;`
  - Grant only explicit functions to explicit roles.
  - Remove `anon` execute on state-changing RPCs.
  - For `SECURITY DEFINER` functions:
    - Add strict authorization checks (`auth.uid()`, role checks).
    - Set fixed `search_path` inside function definition.
    - Prefer `SECURITY INVOKER` unless definer is strictly necessary.

### 2.2 Overly permissive RLS policies (no ownership/tenant scoping)
- Description:
  - Core tables allow all operations for any authenticated user with `USING (true)` and `WITH CHECK (true)`.
  - Evidence:
    - `supabase/migrations/001_initial_schema.sql:24`
    - `supabase/migrations/001_initial_schema.sql:41`
    - `supabase/migrations/001_initial_schema.sql:61`
    - `supabase/migrations/001_initial_schema.sql:80`
    - `supabase/migrations/001_initial_schema.sql:93`
- Exploitation scenario:
  - Any authenticated account can read/modify/delete all patients, prescriptions, medicines, and settings.
- Fix / mitigation:
  - Introduce user/clinic ownership columns (for example `clinic_id`, `created_by`).
  - Replace permissive policies with scoped predicates, for example `USING (clinic_id = auth.jwt() ->> 'clinic_id')`.
  - Separate roles (admin/doctor/staff) and enforce least privilege per table and operation.

### 2.3 Dangerous DB migration runner exposed to application users
- Description:
  - `runDatabaseMigration()` reads and executes every SQL file from `supabase/migrations` using direct DB credentials.
  - The action is imported and invoked from the Settings UI.
  - TLS verification is disabled.
  - Evidence:
    - `src/actions/system.ts:7`
    - `src/actions/system.ts:9`
    - `src/actions/system.ts:23`
    - `src/actions/system.ts:43`
    - `src/components/features/settings/SettingsForm.tsx:10`
    - `src/components/features/settings/SettingsForm.tsx:102`
- Exploitation scenario:
  - Any authenticated app user can trigger schema-level operations or destructive migrations from browser workflow.
  - With disabled cert verification, network interception risk increases for DB connection.
- Fix / mitigation:
  - Remove this action from runtime app surface.
  - Restrict migrations to CI/CD or local admin CLI only.
  - If temporary retention is required:
    - Gate behind strict admin role and environment check.
    - Require one-time signed admin token.
    - Enable TLS verification (`rejectUnauthorized: true`) and certificate pinning where possible.

### 2.4 Sensitive medical data exposure in repository files
- Description:
  - SQL dump files include direct patient names, phone numbers, addresses, diagnoses, and prescription records.
  - Evidence:
    - `Supabase Database/patients_rows.sql:1`
    - `Supabase Database/prescriptions_header_rows.sql:1`
    - `Supabase Database/prescription_details_rows.sql:1`
- Exploitation scenario:
  - Repository leakage, unauthorized clone access, or backup compromise exposes highly sensitive health data.
- Fix / mitigation:
  - Remove real PII from repository history and rotate access where needed.
  - Replace with anonymized/synthetic fixtures.
  - Enforce data-classification and pre-commit secret/PII scanning.

## 3. Authentication & Authorization Issues

### 3.1 No RBAC/ABAC checks in sensitive server actions
- Problem:
  - Sensitive actions (delete, merge, settings update, migration runner) do not perform explicit role checks in action code.
- Risk:
  - Any logged-in user may perform administrative operations.
- Fix:
  - Add centralized authorization helper (for example `requireRole('admin')`) and call in each sensitive action before DB mutation.

### 3.2 Password change flow ignores `currentPassword`
- Problem:
  - `changePassword(currentPassword, newPassword)` receives `currentPassword` but does not verify it before update.
  - Evidence:
    - `src/actions/settings.ts:56`
    - `src/actions/settings.ts:63`
- Risk:
  - If a session is hijacked, attacker can rotate password without knowledge of existing password; weak step-up assurance for critical account operation.
- Fix:
  - Re-authenticate user before password update (for example explicit re-login or OTP step-up).
  - Enforce stronger password policy and recent-auth requirement.

### 3.3 Login throttling/anti-automation not visible
- Problem:
  - Login action directly attempts password sign-in without visible app-level rate limiting.
  - Evidence:
    - `src/actions/auth.ts:19`
- Risk:
  - Increased brute-force and credential-stuffing exposure.
- Fix:
  - Add IP/email throttling, CAPTCHA/challenge after repeated failures, and lockout/backoff policy.

## 4. Data Security Issues

### 4.1 PII/medical records in SQL dump artifacts
- Exposure type:
  - Plaintext personal and medical data in workspace data dumps.
- Impact:
  - Regulatory/privacy breach risk; severe confidentiality impact.
- Fix:
  - Purge historical commits containing real records, migrate to sanitized fixtures.

### 4.2 Broad settings mutation surface
- Exposure type:
  - `updateSetting` and `updateMultipleSettings` accept arbitrary keys/values without server-side allowlist.
  - Evidence:
    - `src/actions/settings.ts:23`
    - `src/actions/settings.ts:37`
- Impact:
  - Configuration tampering, unintended settings injection.
- Fix:
  - Validate keys against explicit enum allowlist and constrain value format/length server-side.

## 5. Frontend Security Issues

### 5.1 Inline script in root layout reduces CSP hardening options
- Vulnerability:
  - Inline script injected through `dangerouslySetInnerHTML`.
  - Evidence:
    - `src/app/layout.tsx:23`
- Attack vector:
  - Not directly exploitable by itself here (content is static), but forces weaker CSP (`unsafe-inline`) unless nonce/hash strategy is used.
- Fix:
  - Move script to external file or apply CSP nonce/hash and strict CSP policy.

### 5.2 Client-side validation is present but critical checks must stay server-side
- Vulnerability:
  - Some flows depend on client form schemas; server validation is present in many actions but inconsistent for settings/system operations.
- Attack vector:
  - Direct action invocation bypassing client form constraints.
- Fix:
  - Enforce schema validation in every server action endpoint, especially admin/sensitive actions.

## 6. Backend & Infrastructure Risks

### 6.1 Migration runner returns internal DB error details to UI
- Issue:
  - SQL and DB errors are propagated and displayed in UI toast.
  - Evidence:
    - `src/actions/system.ts:50`
    - `src/components/features/settings/SettingsForm.tsx:106`
- Risk level:
  - Medium (information disclosure, internal schema/error leakage).
- Fix:
  - Log detailed error server-side only; return generic client-safe message and incident ID.

### 6.2 No Supabase Edge Functions found in provided code
- Issue:
  - Edge-function-specific review scope not applicable for current workspace content.
- Risk level:
  - Informational.
- Fix:
  - If edge functions are added later, enforce auth verification, schema validation, and strict CORS per function.

## 7. Configuration & Headers

### 7.1 Security headers are not configured in Next config
- Missing/misconfigured items:
  - No visible CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy setup.
  - Evidence:
    - `next.config.ts:4`
- Recommended setup:
  - Add strict response headers globally (or per route where needed), for example:
    - `Content-Security-Policy` with nonce/hash-based script policy.
    - `Strict-Transport-Security` (for HTTPS deployments).
    - `X-Content-Type-Options: nosniff`.
    - `X-Frame-Options: DENY` or frame-ancestors CSP.
    - `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Permissions-Policy` with least privilege.

### 7.2 Transport security weakening in DB connection
- Missing/misconfigured items:
  - Database client uses `ssl: { rejectUnauthorized: false }`.
  - Evidence:
    - `src/actions/system.ts:23`
- Recommended setup:
  - Enable certificate validation and avoid disabling TLS verification in production.

## 8. Risk Assessment
- Critical:
  - Global function execute grants + `SECURITY DEFINER` write RPCs with `anon` exposure.
  - Permissive RLS policies (`USING true` / `WITH CHECK true`) on core tables.
  - Runtime-accessible migration runner from Settings UI.
  - Sensitive medical/PII dump files in repository workspace.
- High:
  - Missing RBAC checks for sensitive actions.
  - Password change flow without current-password verification.
- Medium:
  - Missing hard security headers.
  - Internal DB error details surfaced to clients.
  - TLS cert validation disabled for DB connection in migration runner.
- Low:
  - Inline script in layout reduces CSP strictness unless nonce/hash approach is adopted.

## 9. Final Recommendations
1. Immediately revoke blanket RPC execute grants and remove `anon` execute on mutating RPCs.
2. Redesign RLS with ownership/tenant scoping and explicit role-based policy matrix.
3. Remove migration execution from app runtime/UI; move to secured operational pipeline.
4. Purge real patient data from repository history and enforce anonymized fixtures.
5. Add centralized authorization checks (`requireRole`) to all sensitive server actions.
6. Implement step-up authentication for password changes and login anti-bruteforce controls.
7. Add comprehensive security headers and CSP with nonce/hash strategy.
8. Stop returning raw DB errors to clients; use sanitized messages and server logs.
9. Add security regression tests: unauthorized action calls, RPC permission tests, and RLS policy tests per table.

