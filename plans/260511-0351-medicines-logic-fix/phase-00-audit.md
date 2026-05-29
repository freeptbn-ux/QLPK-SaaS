# Phase 00: Audit & Code Mapping
Status: ⬜ Pending
Dependencies: None

## Objective
Identify all code locations and database objects that need modification to ensure no side effects.

## Requirements
### Functional
- [ ] Comprehensive list of files interacting with the `medicines` table.
- [ ] Mapping of all RPCs used in the `/medicines` page.

### Non-Functional
- [ ] Traceability: Every change must be linked to an issue in `medi.md`.

## Implementation Steps
1. [ ] **Codebase Search**: Use `grep` or `ripgrep` to find all occurrences of `medicines` table and related types in the codebase.
2. [ ] **RPC Discovery**: List all Supabase functions (RPCs) that read from or write to the `medicines` table.
3. [ ] **Impact Analysis**: Identify if changing `REAL` to `NUMERIC` will affect any client-side calculations or external integrations.
4. [ ] **Profile Check**: Verify the `get_my_clinic_id()` function logic to ensure it's reliable for multi-tenancy.

## Files to Create/Modify
- `plans/260511-0351-medicines-logic-fix/reports/audit_report.md` - Created during this phase.

## Test Criteria
- [ ] Audit report lists all files mentioned in `medi.md` plus any others found.

---
Next Phase: [Phase 01: Database Schema & Constraints](./phase-01-database-schema.md)
