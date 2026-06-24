# Plan: Clinic Performance and AI Dosage Cache Optimization
Created: 2026-06-24T10:55:00+07:00
Status: 🟡 In Progress

## Overview
This implementation plan addresses three key performance bottlenecks identified in the audit:
1. **Patient List Performance**: Replacing the full table scan aggregation on `prescriptions_header` with a denormalized `last_visit_date` column on `patients` table kept in sync via database triggers.
2. **Medicine Usage Stats**: Offloading in-memory grouping/counting of prescription details to a secure, clinic-scoped database RPC `get_medicine_usage_by_patient`.
3. **AI Dosage Caching**: Implementing a global `medicine_dosage_cache` table to cache Gemini AI responses for 7 days, and resolving the infinite loop bug in the client-side `useMedicineDosage` hook.

## Tech Stack
- Frontend: Next.js 16 (App Router, TypeScript)
- Backend: Supabase (PostgreSQL, Triggers, RPC)
- Testing: Vitest for server actions, API routes, and hooks; SQL verification scripts for database logic

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Patient List Last Visit Optimization | ⬜ Pending | 0% |
| 02 | Medicine Usage Statistics RPC | ⬜ Pending | 0% |
| 03 | AI Dosage Cache & Hook Fix | ⬜ Pending | 0% |

## Quick Commands
- Run Vitest Suite: `npx vitest run`
- Run Patient List tests: `npx vitest run tests/verify-patient-list-optimization`
- Run Medicine Usage tests: `npx vitest run tests/verify-medicine-usage-rpc`
- Run AI Dosage Cache tests: `npx vitest run tests/verify-ai-dosage-cache`
