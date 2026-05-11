# Plan: Fix Critical Statistics & Security Hardening
Created: 2026-05-11 16:05
Status: 🟡 In Progress

## Overview
Vá lỗi bảo mật rò rỉ dữ liệu (Multi-tenancy Leak) và triển khai bảng thống kê cộng dồn (`clinic_daily_stats`) để tối ưu hiệu năng Dashboard.

## Tech Stack
- Database: Supabase (PostgreSQL) + RLS
- Backend: Next.js Server Actions + Day.js (Timezone: Asia/Ho_Chi_Minh)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | [Database: Rollup & Triggers](./phase-01-db-rollup.md) | ⬜ Pending | 0% |
| 02 | [Backend: Security Hardening](./phase-02-backend-hardening.md) | ⬜ Pending | 0% |
| 03 | [Verification & Data Sync](./phase-03-verification.md) | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
