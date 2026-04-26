# Plan: Delete Prescription History
Created: 2026-04-26T15:42:40+07:00
Status: 🟡 In Progress

## Overview
Cho phép người dùng xóa một đơn thuốc cụ thể trong quá khứ trực tiếp từ giao diện Lịch sử khám bệnh (`PrescriptionHistory.tsx`). Khi xóa, hệ thống sẽ xóa toàn bộ chi tiết đơn thuốc (`prescriptions_detail`) và thông tin chung của đơn thuốc (`prescriptions_header`).

## Tech Stack
- Frontend: React (Next.js), Tailwind CSS, framer-motion
- Backend: Next.js Server Actions, Supabase RPC (nếu cần) hoặc direct database call
- Database: PostgreSQL (Supabase)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Backend API & Database | ⬜ Pending | 0% |
| 02 | Frontend UI | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
