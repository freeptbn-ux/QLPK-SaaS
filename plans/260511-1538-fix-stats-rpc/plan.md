# Plan: Fix Statistics & Optimization (Standard v2)
Created: 2026-05-11 15:40
Status: 🟡 In Progress

## Overview
Khắc phục lỗi thiếu hàm RPC đồng thời tối ưu hóa toàn diện Dashboard bằng cách chuyển đổi logic lấy dữ liệu sang bảng tổng hợp `clinic_daily_stats`. Sử dụng các kỹ thuật aggregation hiện đại của Supabase/PostgREST.

## Tech Stack
- **Backend:** Next.js Server Actions
- **Database:** Supabase (PostgreSQL) + PostgREST Aggregates
- **Type Safety:** TypeScript

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Refactor Statistics & Types | ⬜ Pending | 0% |
| 02 | Data Verification & Backfill | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
