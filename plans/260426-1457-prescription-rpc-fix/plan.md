# Plan: Fix Prescription RPC & Database Permission Issues
Created: 2026-04-26T14:57+07:00
Status: ✅ Completed

## Overview
Khắc phục lỗi `"Could not find the function public.create_prescription(...) in the schema cache"` khi bấm "Lưu đơn thuốc" tại `/patients/[id]/prescribe`, đồng thời sửa 4 vấn đề liên quan được phát hiện trong quá trình audit.

## Diagnosis Reference
[prescription_flow_diagnosis.md](file:///C:/Users/Admin/.gemini/antigravity/brain/5197c98e-0483-4e84-9c27-70ff2845853b/artifacts/prescription_flow_diagnosis.md)

## Root Cause Summary
| # | Issue | Severity | Phase |
|---|-------|----------|-------|
| 1 | **Thiếu `GRANT EXECUTE`** trên tất cả 16+ RPC functions → PostgREST không nhìn thấy hàm | 🔴 Critical | Phase 01 |
| 2 | **Revenue double-counting** — `consultation_fee` bị tính 2 lần trong `get_revenue_stats` | 🟡 Medium | Phase 02 |
| 3 | **Migration runner (`system.ts`)** chỉ chạy 2/11 files, thiếu idempotency | 🟡 Medium | Phase 03 |
| 4 | **Server-side dùng `anon` key** — cần đảm bảo GRANT cho đúng role | 🟡 Medium | Phase 01 |
| 5 | **Thiếu `DB_PASSWORD`** trong `.env.local` → migration runner bị broken | 🟡 Low | Phase 03 |

## Tech Stack
- Frontend: Next.js 15 (App Router) + React 19
- Backend: Server Actions + Supabase Client
- Database: PostgreSQL (Supabase hosted) + PostgREST API
- Validation: Zod

## Phases

| Phase | Name | Status | Tasks | Progress |
|-------|------|--------|-------|----------|
| 01 | Grant RPC Permissions | ✅ Done | 5 | 100% |
| 02 | Fix Revenue Double-Counting | ✅ Done | 4 | 100% |
| 03 | Harden Migration Runner | ✅ Done | 5 | 100% |
| 04 | Verification & Smoke Test | ✅ Done | 6 | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| GRANT lên function chưa tồn tại → SQL error | Phase 01 verify `pg_proc` trước khi GRANT |
| Revenue fix ảnh hưởng dashboard đang hoạt động | Phase 02 kiểm tra logic trước khi apply |
| Migration runner chạy lại migration đã apply → lỗi | Phase 03 dùng `CREATE OR REPLACE` + `IF NOT EXISTS` |
