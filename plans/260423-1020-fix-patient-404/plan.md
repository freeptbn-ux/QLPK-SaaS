# Plan: Fix Patient Detail 404 & Related Bugs

**Created:** 2026-04-23 10:20
**Status:** 🟡 In Progress

## 🐛 Vấn đề

Khi truy cập `/patients/767` (hoặc bất kỳ ID bệnh nhân nào), trang hiển thị **404 - Không tìm thấy trang** mặc dù bệnh nhân có tồn tại trong database.

## 🔍 Nguyên nhân gốc (Root Cause)

| # | Lỗi | Mức độ | File |
|---|------|--------|------|
| 1 | `getPatientById` truy vấn `medicines(name, unit)` nhưng bảng `medicines` **không có cột `unit`** (đúng phải là `packing_spec`). Supabase PostgREST trả lỗi → hàm return `null` → `notFound()` → 404 | 🔴 Critical | `src/actions/patients.ts:61` |
| 2 | Trang prescribe dùng `params: { id: string }` (pattern cũ), Next.js 16 yêu cầu `params: Promise<{ id: string }>` + `await params` | 🟡 Medium | `src/app/(dashboard)/patients/[id]/prescribe/page.tsx` |
| 3 | RPC `create_prescription` cập nhật `updated_at` nhưng bảng `patients` không có cột này trong schema ban đầu | 🟡 Medium | `supabase/migrations/002_create_prescription_rpc.sql` |

## 📋 Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Fix Supabase Query - Sửa truy vấn sai cột | ⬜ Pending | 0% |
| 02 | Fix Next.js Params Pattern - Cập nhật prescribe page | ⬜ Pending | 0% |
| 03 | Fix Database Schema - Thêm cột thiếu & Migration | ⬜ Pending | 0% |

**Tổng:** 9 tasks | Ước tính: 1 session (~15 phút)

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
