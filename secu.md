# Security Audit Report - QLPK-SaaS

Date: 2026-05-11  
Auditor Role: Principal Application Security Engineer / SaaS Security Auditor  
Scope: Full repository review (Next.js App Router, Server Actions, Supabase Auth/JWT, PostgreSQL RLS, Gemini integration, CI workflows, dependency lockfile)

## Executive Summary
The codebase has a solid security foundation (server-side auth checks, widespread RLS usage, input validation with Zod, and tenant-aware data model updates), but it still contains several exploitable production-grade risks.

Most severe findings are not theoretical:
- A hardcoded production-style PostgreSQL credential is committed in source code.
- A CI workflow continuously dumps full database data and pushes archives to a Git branch.
- Migration-level privilege drift grants broad access to anon and weakens long-term multi-tenant guarantees.

Overall risk posture: High.

## Threat Model Overview
- Internet-facing SaaS handling medical and prescription data.
- Multi-tenant trust boundary is clinic_id.
- Primary attacker profiles:
  - Unauthenticated internet attacker using public anon key / REST endpoints.
  - Low-privileged authenticated tenant user attempting cross-tenant reads/writes.
  - External actor harvesting secrets from repo/CI artifacts.
  - Abuse actor driving AI endpoint cost blowups and unsafe medical outputs.
- High-value assets:
  - Patient PII/health records.
  - Prescription and billing data.
  - Supabase service credentials and DB credentials.
  - Tenant isolation integrity.

## Authentication Security Analysis
- Positive:
  - Most sensitive server actions call getAuthUser() before data operations.
  - Middleware session refresh via Supabase SSR pattern is implemented.
- Weaknesses:
  - clinic_id is read from user_metadata in critical paths instead of always deriving from profiles table.
  - No visible MFA enforcement or readiness hooks (no mfa flows found in src).
  - Login and API surfaces have no visible application-level rate limiting.

## Authorization & Access Control Analysis
- Positive:
  - RLS policies are present for key business tables (patients, medicines, prescriptions, settings).
  - Tenant-aware constraints and RPC hardening efforts exist.
- Critical concerns:
  - Privilege drift in migrations re-grants broad anon/authenticated rights after prior revocations.
  - clinics table is created without RLS and can become a cross-tenant integrity choke point when combined with broad grants.
  - Several migrations grant EXECUTE broadly to anon/public, creating future bypass risk for newly introduced functions.

## Frontend Security Analysis
- No dangerous dangerouslySetInnerHTML usage found in src.
- AI output rendering currently uses React text rendering (not raw HTML injection), which is good.
- CSP is weak due unsafe-inline and unsafe-eval, reducing XSS blast-radius protections.
- localStorage is used for theme mode only (low data sensitivity).

## Backend Security Analysis
- API route /api/medicine-dosage authenticates user via getAuthUser(), but:
  - Prompt injection is feasible due direct user-controlled interpolation into prompt.
  - No rate limiting on expensive external AI calls.
  - External provider errors are logged; this can leak operational details in centralized logs.

## Database & RLS Security Analysis
- RLS exists for most high-value tables.
- Critical governance issues remain:
  - Broad grants to anon/authenticated on all tables/functions in multiple migrations.
  - Default privileges grant table DML to anon for future tables in public schema.
  - clinics table has no RLS policy guardrail.
- SECURITY DEFINER use is widespread; this is acceptable only with strict execution grants and explicit ownership checks everywhere.

## Infrastructure & Deployment Security
- Security headers exist, but CSP policy is weak.
- No visible custom rate limiting middleware.
- GitHub Actions backup workflow stores full DB dumps in repository branch, creating major exposure and retention risk.

## AI Integration Security Analysis
- Prompt injection risk in medicine lookup endpoint.
- No strong output safety gating for medical recommendations (response trust is high).
- Grounded search integration increases external prompt-manipulation and content poisoning exposure.
- No explicit PII scrubbing before third-party AI request forwarding.

## Dependency & Supply Chain Risks
Lockfile audit (npm audit --package-lock-only --json) reported:
- High: next-devtools-mcp transitive issues (@modelcontextprotocol/sdk, undici).
- Moderate: next/postcss advisory chain.

These are actionable supply-chain findings, especially where development tooling may cross trust boundaries.

## Sensitive Data Exposure Risks
- Hardcoded DB host and password committed in scripts/check_and_fix_sequence.js.
- CI workflow persists complete roles/schema/data dumps to db-backups branch.
- Operational logs may retain detailed provider/database error payloads.

## Multi-tenancy Isolation Analysis
- Intended model is clinic_id-based isolation enforced through RLS and tenant-aware RPC logic.
- Isolation is weakened by permission drift and missing RLS on clinics.
- JWT claim trust (user_metadata clinic_id) in selected code paths creates avoidable tenancy risk.

## Findings

### 1) Hardcoded PostgreSQL Credentials in Repository Script
- Severity level: Critical
- CVSS-like impact estimation: 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- Affected files/components:
  - scripts/check_and_fix_sequence.js:9
  - scripts/check_and_fix_sequence.js:13
- Technical explanation:
  - The script includes direct DB host/user/password literals for a Supabase database endpoint.
- Root cause:
  - Secret management bypassed in favor of hardcoded emergency operational script.
- Attack scenario:
  - Any actor with repository read access reuses credentials to connect directly and query/modify production data.
- Exploitability assessment:
  - Immediate and trivial if network path to DB is reachable.
- Business impact:
  - Full compromise of medical system integrity and confidentiality.
- Data exposure impact:
  - Complete patient and prescription dataset compromise.
- Recommended fix:
  - Rotate DB password immediately; revoke and regenerate credentials; invalidate all derived tokens.
  - Remove secret from git history and force secret scanning.
- Secure refactoring suggestion:
  - Use environment variables + short-lived credentials from secret manager/Vault.
- Code example if applicable:
```js
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: true }
});
```

### 2) Full Database Dumps Published by CI Workflow
- Severity level: Critical
- CVSS-like impact estimation: 9.1 (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:L)
- Affected files/components:
  - .github/workflows/supabase-backup.yml:34
  - .github/workflows/supabase-backup.yml:36
  - .github/workflows/supabase-backup.yml:50
  - .github/workflows/supabase-backup.yml:52
- Technical explanation:
  - Workflow dumps full roles/schema/data and pushes archives to a long-lived branch.
- Root cause:
  - Backups handled as git artifacts instead of encrypted object storage with strict IAM.
- Attack scenario:
  - If repo/branch visibility is misconfigured or compromised, attacker pulls historical full-data backups.
- Exploitability assessment:
  - High in real-world org misconfiguration or token compromise scenarios.
- Business impact:
  - Regulatory breach (medical data), legal exposure, reputational damage.
- Data exposure impact:
  - Historic full snapshots of patient and financial data.
- Recommended fix:
  - Stop committing backups to git immediately.
  - Move backups to encrypted bucket with key management and retention controls.
- Secure refactoring suggestion:
  - Use cloud backup target + immutable retention + access logs + break-glass restores.
- Code example if applicable:
```yaml
# Replace git push backup with encrypted object storage upload
- run: |
    supabase db dump --db-url "$SUPABASE_DB_URL" -f backup.sql --data-only --use-copy
    gpg --symmetric --cipher-algo AES256 backup.sql
    aws s3 cp backup.sql.gpg s3://secure-backups/ --sse aws:kms
```

### 3) Privilege Drift: Broad Anon Grants + No RLS on clinics
- Severity level: Critical
- CVSS-like impact estimation: 9.0 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- Affected files/components:
  - supabase/migrations/20260427190000_grant_permissions.sql:2
  - supabase/migrations/20260427190000_grant_permissions.sql:4
  - supabase/migrations/20260427181500_rls_redesign.sql:13
  - supabase/migrations/20260427181500_rls_redesign.sql:32
- Technical explanation:
  - Migration grants DML on all public tables (including anon) and default privileges for future tables.
  - clinics table is created, but no RLS is enabled for it.
- Root cause:
  - Security hardening steps were later partially undone by broad grant migration.
- Attack scenario:
  - Unauthenticated actor uses public anon key with REST access to manipulate/degrade non-RLS tables (e.g., clinics), causing tenant integrity failures and service disruption.
- Exploitability assessment:
  - High if public schema exposure is enabled in Data API configuration (common default).
- Business impact:
  - Tenant mapping corruption, outage conditions, severe trust breach.
- Data exposure impact:
  - Potential metadata leakage and cross-tenant impact through structural tampering.
- Recommended fix:
  - Revoke anon DML globally.
  - Enable RLS on clinics and add explicit least-privilege policies.
  - Remove dangerous default privileges for anon.
- Secure refactoring suggestion:
  - Adopt explicit per-table grants and deny-by-default migration template.
- Code example if applicable:
```sql
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY clinics_authenticated_read ON clinics
  FOR SELECT TO authenticated USING (id = get_my_clinic_id());
```

### 4) Over-Broad Function Execute Grants to anon/public
- Severity level: High
- CVSS-like impact estimation: 8.2 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:L)
- Affected files/components:
  - supabase/migrations/002_create_prescription_rpc.sql:119
  - supabase/migrations/006_merge_patients_rpc.sql:53
  - supabase/migrations/008_statistics_rpcs.sql:179
  - supabase/migrations/010_monthly_revenue_rpc.sql:14
  - supabase/migrations/20260426112520_security_concurrency.sql:118
- Technical explanation:
  - Multiple migrations grant EXECUTE ON ALL FUNCTIONS to anon/authenticated.
  - With widespread SECURITY DEFINER usage, future function additions can become silently overexposed.
- Root cause:
  - Convenience grants instead of explicit allow-listing per function.
- Attack scenario:
  - New privileged function deployed later becomes callable by anon due inherited broad grants, leading to immediate unauthorized data access/modification.
- Exploitability assessment:
  - High as a time-bomb architecture flaw.
- Business impact:
  - Sudden production breach upon routine schema evolution.
- Data exposure impact:
  - Cross-tenant leakage depending on function semantics.
- Recommended fix:
  - Replace global execute grants with explicit GRANT per RPC.
  - Add CI SQL lint rule to block GRANT EXECUTE ON ALL FUNCTIONS.
- Secure refactoring suggestion:
  - Keep SECURITY DEFINER functions in private schema and expose only tightly scoped wrappers.
- Code example if applicable:
```sql
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_stats_by_week(int) TO authenticated;
```

### 5) Prompt Injection and Unsafe AI Output Trust in Medicine Endpoint
- Severity level: High
- CVSS-like impact estimation: 8.0 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L)
- Affected files/components:
  - src/app/api/medicine-dosage/route.ts:16
  - src/app/api/medicine-dosage/route.ts:46
  - src/app/api/medicine-dosage/route.ts:80
- Technical explanation:
  - User input medicineName is directly interpolated into prompt text.
  - Response is trusted as medical guidance without robust guardrails.
- Root cause:
  - No prompt sandboxing, no output policy validation, no adversarial prompt filters.
- Attack scenario:
  - Authenticated user injects malicious instructions in medicineName to force unsafe or policy-violating outputs; could social-engineer clinicians with harmful dosage guidance.
- Exploitability assessment:
  - Practical and low-effort.
- Business impact:
  - Clinical safety incidents, legal liability, trust erosion.
- Data exposure impact:
  - Potential leakage of sensitive context sent to external AI/search providers.
- Recommended fix:
  - Strong server-side input policy, structured prompting, output schema validation, and medical-risk classifier before display.
- Secure refactoring suggestion:
  - Isolate user term from instructions and force JSON schema output with strict parser.
- Code example if applicable:
```ts
const payload = {
  medicine: sanitizedMedicine,
  locale: 'vi-VN',
  task: 'dosage_lookup'
};
// model prompt references payload fields, never raw string interpolation
```

### 6) clinic_id Authorization Uses Mutable JWT user_metadata in App Paths
- Severity level: Medium
- CVSS-like impact estimation: 6.8 (AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:N)
- Affected files/components:
  - src/lib/supabase/auth.ts:17
  - src/actions/medicines.ts:192
- Technical explanation:
  - clinic_id is taken from user.user_metadata in selected logic paths rather than consistently sourced from profiles/get_my_clinic_id.
- Root cause:
  - Mixed trust model between JWT metadata and DB source-of-truth.
- Attack scenario:
  - Under metadata desync or upstream auth issue, operations may evaluate ownership with stale/incorrect clinic context.
- Exploitability assessment:
  - Moderate, but avoidable and high-impact if triggered.
- Business impact:
  - Potential tenant-boundary confusion and incorrect authorization decisions.
- Data exposure impact:
  - Possible cross-tenant reads/writes in edge conditions.
- Recommended fix:
  - Always resolve clinic_id from profiles table or trusted DB function.
- Secure refactoring suggestion:
  - Centralize clinic resolution in one helper and ban direct user_metadata authorization use.
- Code example if applicable:
```ts
const { clinicId } = await getAuthUser(); // internally DB-verified
```

### 7) Weak CSP Reduces XSS Containment
- Severity level: Medium
- CVSS-like impact estimation: 6.1 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)
- Affected files/components:
  - next.config.ts:27
- Technical explanation:
  - script-src allows unsafe-inline and unsafe-eval.
- Root cause:
  - CSP compatibility prioritization over strict policy hardening.
- Attack scenario:
  - Any discovered XSS vector has far greater impact due permissive script execution policy.
- Exploitability assessment:
  - Depends on existence of XSS bug elsewhere; policy currently weakens defense-in-depth.
- Business impact:
  - Account/session compromise risk if XSS is introduced.
- Data exposure impact:
  - Token/session theft and on-behalf actions.
- Recommended fix:
  - Move to nonce/hash-based CSP; remove unsafe-inline/unsafe-eval.
- Secure refactoring suggestion:
  - Introduce middleware-generated nonce and strict-dynamic policy where needed.
- Code example if applicable:
```txt
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{nonce}'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

### 8) No Application-Level Rate Limiting on High-Cost/High-Risk Paths
- Severity level: Medium
- CVSS-like impact estimation: 6.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H)
- Affected files/components:
  - src/app/api/medicine-dosage/route.ts:1
  - src/actions/auth.ts:7
  - src/lib/supabase/proxy.ts:42
- Technical explanation:
  - No visible per-user/IP throttling for login or Gemini-backed endpoint.
- Root cause:
  - Reliance on platform defaults without app-layer abuse controls.
- Attack scenario:
  - Credential stuffing and API-cost exhaustion via repeated requests.
- Exploitability assessment:
  - High practicality.
- Business impact:
  - Service degradation, increased spend, lockouts and noisy incidents.
- Data exposure impact:
  - Indirect (availability and operational disruption).
- Recommended fix:
  - Implement route-level and action-level throttling with user/IP keys.
- Secure refactoring suggestion:
  - Add centralized rate-limit middleware + anomaly alerts.
- Code example if applicable:
```ts
if (!(await rateLimiter.consume(`dosage:${user.id}`))) {
  return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
}
```

### 9) Sensitive Error/Operational Data Logged Verbosely
- Severity level: Low
- CVSS-like impact estimation: 4.3 (AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N)
- Affected files/components:
  - src/lib/error-handler.ts:7
  - src/app/api/medicine-dosage/route.ts:124
- Technical explanation:
  - Internal errors are logged with potentially rich payloads; centralized logs can become secondary sensitive data store.
- Root cause:
  - Debug logging not redacted by data classification.
- Attack scenario:
  - Insider or log-platform compromise exposes sensitive request/stack metadata.
- Exploitability assessment:
  - Moderate in mature environments with broad log access.
- Business impact:
  - Compliance and audit risk.
- Data exposure impact:
  - Partial metadata and internal diagnostics leakage.
- Recommended fix:
  - Structured redacted logging with explicit deny-list for secrets/PII.
- Secure refactoring suggestion:
  - Introduce logger wrapper that strips sensitive fields before emit.
- Code example if applicable:
```ts
logger.error('provider_error', redact({ code: err.code, msg: err.message }));
```

### 10) Dependency Vulnerabilities in Tooling Chain
- Severity level: Medium
- CVSS-like impact estimation: 5.9 (varies per advisory)
- Affected files/components:
  - package.json:43
  - package-lock.json (transitive tree)
- Technical explanation:
  - npm audit reports high advisories in next-devtools-mcp transitives (@modelcontextprotocol/sdk, undici) and moderate advisory chain through next/postcss.
- Root cause:
  - Outdated transitive dependencies and dev tooling exposure.
- Attack scenario:
  - Malicious payloads targeting vulnerable parser/network paths during dev or CI contexts.
- Exploitability assessment:
  - Context-dependent but non-negligible in shared CI/dev environments.
- Business impact:
  - Supply-chain compromise potential and unstable build surface.
- Data exposure impact:
  - Possible leak or service interruption depending exploit path.
- Recommended fix:
  - Pin and update vulnerable packages; remove unnecessary devtools from production build chain.
- Secure refactoring suggestion:
  - Separate prod/runtime and devtool dependency boundaries with stricter lockfile governance.
- Code example if applicable:
```bash
npm audit --package-lock-only
npm outdated
npm update <target-package>
```

### 11) MFA Readiness Gap for Internet-Facing Medical SaaS
- Severity level: Low
- CVSS-like impact estimation: 4.7 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N)
- Affected files/components:
  - src/actions/auth.ts:7
- Technical explanation:
  - No visible second-factor enrollment/challenge flow.
- Root cause:
  - Auth implementation limited to password-based login.
- Attack scenario:
  - Credential reuse attack succeeds without additional factor.
- Exploitability assessment:
  - Common attack pattern in internet-facing apps.
- Business impact:
  - Increased account takeover probability.
- Data exposure impact:
  - Tenant data exposure under compromised accounts.
- Recommended fix:
  - Enforce MFA for privileged roles (admin/doctor) and step-up for sensitive actions.
- Secure refactoring suggestion:
  - Integrate Supabase MFA policy checks in login/session management.
- Code example if applicable:
```ts
// Enforce role-based MFA requirement before granting sensitive views/actions.
```

## Critical Vulnerabilities
1. Hardcoded DB credentials committed in repository script.
2. Full database backups published to git branch via CI.
3. Privilege drift enabling broad anon table grants with clinics lacking RLS.

## Exploitation Scenarios
1. Secret-harvesting attacker pulls repository, uses leaked DB password, exfiltrates patient + prescription data, and alters records.
2. Compromised GitHub token/branch visibility issue exposes historical compressed DB snapshots.
3. Unauthenticated attacker with anon key targets non-RLS clinics table and manipulates tenant structure, causing broad service degradation.
4. Authenticated low-privilege user weaponizes medicineName prompt injection to force unsafe dosage output and clinician-side misuse.
5. Botnet repeatedly calls AI endpoint to induce cost spikes and availability degradation.

## Quick Security Wins
1. Rotate and revoke exposed DB credentials immediately; purge from git history.
2. Disable backup-to-git workflow; move backups to encrypted storage.
3. Revoke anon table DML and remove default privileges for anon in public schema.
4. Enable RLS and explicit policies on clinics (or move it to private schema).
5. Remove unsafe-inline and unsafe-eval from CSP.
6. Replace user_metadata-based clinic_id authorization with DB-verified source.
7. Add strict rate limits to login and /api/medicine-dosage.

## Long-term Security Hardening Strategy
- Build migration security gates:
  - Block broad grants (ALL TABLES / ALL FUNCTIONS to anon/public) in CI.
  - Enforce RLS required for every table in exposed schemas.
- Adopt zero-trust function exposure:
  - Private schema for SECURITY DEFINER logic.
  - Public wrappers with explicit ownership checks and minimal grants.
- Mature AI safety controls:
  - Prompt isolation, output schema validation, medical safety classifier, and provider data minimization.
- Strengthen identity controls:
  - MFA for privileged users, anomaly detection, session hardening, and periodic auth posture review.
- Logging and monitoring:
  - Redacted structured logs, high-signal security alerts, and immutable audit trail for sensitive actions.

## Priority Remediation Roadmap
### P0 (0-24 hours)
1. Rotate leaked DB credentials and invalidate any dependent access paths.
2. Disable CI backup publication to git branch.
3. Deploy emergency SQL migration revoking anon DML and default table privileges.

### P1 (24-72 hours)
1. Enable RLS + strict policies on clinics.
2. Remove broad EXECUTE grants and enforce explicit RPC grants only.
3. Patch medicine-dosage prompt injection and add output validation.

### P2 (3-7 days)
1. Tighten CSP with nonce/hash model.
2. Implement app-layer rate limiting and abuse detection.
3. Refactor clinic_id authorization to DB-only trust model.

### P3 (1-3 weeks)
1. Implement MFA policy for privileged roles.
2. Reduce log sensitivity and deploy SIEM-oriented alerting.
3. Resolve dependency advisories and split devtool trust boundaries.

