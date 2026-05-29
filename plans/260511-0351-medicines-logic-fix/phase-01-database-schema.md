# Phase 01: Database Schema & Constraints
Status: ✅ Completed (2026-05-11)
Dependencies: None

## Objective
Fix critical multi-tenancy violations and data leakage issues in the database schema.

## Requirements
### Functional
- [ ] Prevent medicine name collisions across different clinics.
- [ ] Ensure every medicine record is explicitly linked to a valid clinic (`NOT NULL`).

### Non-Functional
- [ ] Security: Prevent cross-clinic data visibility and unauthorized anonymous access.
- [ ] Maintainability: Clean migration path for existing data.

## Implementation Steps
1. [ ] **Analyze existing constraints**: Verify `medicines` table structure.
2. [ ] **Create Migration**:
    - [ ] Drop `UNIQUE(name)` constraint.
    - [ ] Add `UNIQUE(name, clinic_id)` constraint.
    - [ ] Set `clinic_id` to `NOT NULL` after backfilling existing data (if any).
    - [ ] Remove default `1` from `clinic_id` column to prevent accidental leakage.
    - [ ] Update trigger `set_clinic_id_from_profile` to throw an exception if `clinic_id` cannot be determined.
    - [ ] **Security Hardening**: Explicitly `REVOKE EXECUTE` on all medicine-related RPCs from the `anon` role.
3. [ ] **Apply Migration**: Run SQL in Supabase.

## Files to Create/Modify
- `supabase/migrations/[TIMESTAMP]_fix_medicines_multitenancy.sql`

## Test Criteria
- [ ] Clinic A and B can have medicines with the same name.
- [ ] Inserting medicine without a profile results in a database error (not falling back to Clinic 1).
- [ ] Anonymous calls to medicine RPCs are blocked (403/Permission Denied).

---
Next Phase: [Phase 02: Data Integrity & Types](./phase-02-data-integrity.md)
