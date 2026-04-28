# Plan: Inventory Fixes (Sửa lỗi luồng điều chỉnh tồn kho)
Created: 2026-04-27 18:37
Status: 🟡 In Progress

## Overview
Dựa vào báo cáo lỗi logic tại `tonkho.md`, plan này nhằm mục đích vá các lỗ hổng liên quan đến:
1. Race Condition khi cập nhật số lượng tồn kho.
2. Thiếu tính nguyên tử khi thực hiện các thay đổi số lượng.
3. Thiếu bảng theo dõi lịch sử cập nhật (Audit Logs).
4. Mâu thuẫn quy tắc nghiệp vụ về số lượng tồn (cho phép hay không cho phép âm).
5. Thiếu Server-side Validation cho API điều chỉnh tồn.

## Tech Stack
- Frontend: Next.js + React
- Backend: Next.js Server Actions
- Database: Supabase PostgreSQL + RPC

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Database & RPC | ⬜ Pending | 0% |
| 02 | Backend Actions | ⬜ Pending | 0% |
| 03 | Frontend Fixes | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
