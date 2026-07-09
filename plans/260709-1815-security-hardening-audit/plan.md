# Plan: Security Hardening — Audit Remediation
Created: 2026-07-09T18:15:00+07:00
Status: 🟡 In Progress

## Overview

This plan addresses the **5 security issues** identified in the audit on 09/07/2026.
Two of them (`#1 RLS disabled` + `#2 anon full access`) are **critical** — combined, they
allow any unauthenticated person with the public anon key to read/write/delete all patient
data without logging in. The plan fixes all five issues in the safest, least-risky order.

## Audit Issues Covered

| # | Issue | Severity |
|---|-------|----------|
| 1 | RLS disabled on 4 core tables | 🔴 Critical |
| 2 | `anon` role has FULL privileges on 7 tables | 🔴 Critical |
| 3 | Next.js middleware `proxy.ts` is silently ignored | 🔴 Critical |
| 4 | Login leaks Supabase error messages + no app-level rate limiting | 🟡 Warning |
| 5 | CSP uses `unsafe-inline` and `unsafe-eval` | 🟡 Warning |

## Tech Stack Context

- **Framework:** Next.js 16.2.4 (uses `proxy.ts` / `export function proxy` convention)
- **Database:** Supabase (PostgreSQL 17) with existing RLS policies already written
- **Auth:** Supabase Auth (`@supabase/ssr`)
- **Testing:** Vitest (unit/integration), `.sql` files (run via Supabase MCP)

## Phases

| Phase | Name | Status | Priority |
|-------|------|--------|----------|
| 01 | Enable RLS + Revoke Anon Privileges (DB) | ⬜ Pending | 🔴 Critical |
| 02 | Fix Next.js Middleware — Rename Function & Add Route Guard | ⬜ Pending | 🔴 Critical |
| 03 | Fix Login Error Leakage + Server-Side Password Validation | ⬜ Pending | 🟡 Warning |
| 04 | Harden CSP — Remove unsafe-inline / unsafe-eval | ⬜ Pending | 🟡 Warning |

> **Why 4 phases not 5?** Issues #1 and #2 (RLS + anon) are fixed together in one
> atomic migration — splitting them would leave the database half-secured between steps.

## Quick Commands

- Run Phase 1 tests:  `npx vitest run tests/security-hardening/phase-01.test.ts`
- Run Phase 2 tests:  `npx vitest run tests/security-hardening/phase-02.test.ts`
- Run Phase 3 tests:  `npx vitest run tests/security-hardening/phase-03.test.ts`
- Run Phase 4 tests:  `npx vitest run tests/security-hardening/phase-04.test.ts`
- Run all:            `npx vitest run tests/security-hardening/`
