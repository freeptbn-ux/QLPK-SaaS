# Changelog

## [2026-05-11]
### Added
- Automated Daily Backup to Google Drive via GitHub Actions.
- Rclone configuration for secure database dump storage.

### Fixed
- **Critical Security**: Removed hardcoded database credentials from the repository.
- **Infrastructure**: Resolved IPv6 connectivity issues in GitHub Actions by switching to Supavisor Pooler.
- **Rclone**: Fixed base64 decoding error in CI/CD by using non-wrapping encoding.
- **Backdoor Entry**: Disabled `src/actions/system.ts` which allowed client-side migration execution.

### Security
- Migrated all database secrets to GitHub Secrets and `.env`.
- **Revoked Anon Access**: Removed all permissions for the `anon` role on the `public` schema.
- **Enforced RLS**: Enabled Row Level Security on the `clinics` table and added multi-tenancy policies.
- **Lockdown Complete**: Successfully finished all phases of Security Hardening Group 1.
- **AI Hardening**: Implemented 4-phase security hardening for `medicine-dosage` API.
  - Zod-based input validation (Length, Regex, Keyword Blacklist).
  - Prompt Injection mitigation via Delimiters and System Instructions.
  - Enforced Structured Output using Gemini JSON Schema.
  - Added comprehensive Adversarial Testing suite.

### Added
- **Optimized Statistics Engine**: Introduced `clinic_daily_stats` rollup table for near-instant dashboard loading.
- **Data Integrity Tests**: New `src/test/stats_integrity.test.ts` to verify reconciliation and security isolation.
- Vietnamese `README.md` with project overview and tech stack.
- New adversarial and unit test files for AI safety verification.

### Fixed
- **Critical Security**: Patched data leak in `getOverviewStats` and `getRevenueStats` by enforcing `clinic_id` filtering.
- **Reporting Accuracy**: Fixed 7-hour timezone delay in monthly reports using `dayjs.tz`.
- **Chart Logic**: Implemented proper weekly and monthly grouping for revenue statistics.
- **Runtime Error**: Resolved `ReferenceError: useMedicineDosage is not defined` in `PrescriptionForm.tsx`.

### Changed
- **Gemini Architecture**: Refactored `medicine-dosage` API to use a **Two-Step Architecture**.
  - **Step 1 (Grounding)**: Uses Google Search to fetch real-world medicine data.
  - **Step 2 (Structuring)**: Formats the fetched data into a strict JSON schema.
  - This solves the conflict where Gemini cannot use Search and JSON mode in a single call.
- **AI Model**: Switched to `gemini-2.5-flash-lite` for improved cost-performance and stability.
- **Security**: Removed expired/leaked API keys and transitioned to environment-based key management in tests.

### Added
- **Pediatric Dosage Refactor**: Enhanced AI prompts and UI for better clinical accuracy.
- **UX Highlighting**: Implemented automatic bolding for age group headings in dosage results.
- **Scrollable Modal**: Added scroll support and single-column layout for medicine dosage lookup.
- **UX Tests**: New test suite for verifying formatting markers (`-`, `+`) and real-world medicine accuracy.

### Changed
- **Dosage Layout**: Reordered sections to prioritize "Children" dosage over "Adults" and "Usage".
- **AI Prompts**: Refined formatting instructions to enforce hierarchical age-based structure.

