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
- Vietnamese `README.md` with project overview and tech stack.
- New adversarial and unit test files for AI safety verification.

