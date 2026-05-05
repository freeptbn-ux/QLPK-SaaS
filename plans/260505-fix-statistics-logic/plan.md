# Plan: Sửa Lỗi Logic Module Thống Kê

Created: 2026-05-05T20:17:00+07:00
Status: 🟡 In Progress
Source: [thongke.md](/home/skul9x/Desktop/Test_code/QLPK-SaaS-main/thongke.md)

## Overview

Sửa toàn bộ **8 lỗi logic** trong module Thống kê (`/statistics`) bao gồm:
- 4 lỗi 🔴 nghiêm trọng (doanh thu sai, biểu đồ trống/sai dữ liệu)
- 3 lỗi 🟡 trung bình (dữ liệu tĩnh, legacy DOB, estimated count)
- 1 lỗi 🟢 nhẹ (floating-point)

## Tech Stack
- **Database:** Supabase PostgreSQL (RPC functions)
- **Frontend:** Next.js + TypeScript + Recharts
- **Backend:** Server Actions (`src/actions/statistics.ts`)

## Phases

| Phase | Name | Fixes | Status | Effort |
|-------|------|-------|--------|--------|
| 01 | Fix Revenue RPCs | Bug #1 | ⬜ Pending | Thấp |
| 02 | Fix AgeGroup RPCs | Bug #3, #4 | ⬜ Pending | Thấp |
| 03 | Revenue Chart Multi-Granularity | Bug #2 | ⬜ Pending | Trung bình |
| 04 | Frontend Quick Fixes | Bug #5, #8 | ⬜ Pending | Thấp |
| 05 | Legacy DOB & Floating-Point | Bug #6, #7 | ⬜ Pending | Trung bình |
| 06 | Testing & Verification | All | ⬜ Pending | Trung bình |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`

## Dependencies
```
Phase 01 ──→ Phase 03 (Revenue RPC phải fix trước khi refactor)
Phase 02 ──→ (độc lập)
Phase 04 ──→ (độc lập)
Phase 05 ──→ (độc lập)
Phase 01,02,03,04,05 ──→ Phase 06 (test cuối)
```
