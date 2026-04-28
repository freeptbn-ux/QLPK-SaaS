# Plan: Fix RLS Infinite Recursion (PL/pgSQL)
Created: 2026-04-28 09:55
Status: 🟡 In Progress

## Overview
Khắc phục triệt để lỗi đệ quy vô hạn (infinite recursion - 42P17) trên bảng `profiles` do tính năng SQL function inlining của PostgreSQL. Chuyển đổi các hàm helper (`get_my_role`, `get_my_clinic_id`) sang ngôn ngữ `plpgsql` để đảm bảo bypass RLS thành công.

## Tech Stack
- Database: PostgreSQL (Supabase)
- Tool: Supabase Migrations

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Database Migration | ⬜ Pending | 0% |
| 02 | End-to-End Testing | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
