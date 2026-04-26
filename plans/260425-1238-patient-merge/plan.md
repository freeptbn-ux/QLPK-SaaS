# Plan: Patient Merge (Gộp hồ sơ bệnh nhân)
Created: 2026-04-25T12:38:00
Status: 🟡 In Progress

## Overview
Gộp các hồ sơ bệnh nhân bị trùng lặp (do lỗi nhập liệu cũ tạo nhiều ID cho 1 bệnh nhân). Tìm các bệnh nhân trùng (Tên không dấu, Ngày sinh, Số điện thoại), hiển thị để Bác sĩ đối chiếu, và gộp (chuyển prescriptions về Master ID, xóa Duplicate IDs).

## Tech Stack
- Frontend: Next.js + TailwindCSS + React Icons
- Backend: Next.js Server Actions / Supabase RPC
- Database: Supabase PostgreSQL

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Database & API Action | ⬜ Pending | 0% |
| 02 | Frontend UI Components | ⬜ Pending | 0% |
| 03 | Integration | ⬜ Pending | 0% |
| 04 | Testing & Verification | ✅ Complete | 100% |
| 05 | Bugfix: API & React Keys | ✅ Complete | 100% |

## Quick Commands
- Bắt đầu Phase 1: `/code phase-01`
- Xem việc tiếp theo: `/next`
- Lưu context: `/save-brain`
