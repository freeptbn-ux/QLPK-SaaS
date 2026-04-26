# Plan: Edit Prescription (Sửa Đơn Thuốc)
Created: 2026-04-26T16:28:00+07:00
Status: ✅ Completed
Brief: [BRIEF-edit-prescription.md](../../docs/BRIEF-edit-prescription.md)

## Overview
Cho phép người dùng **sửa đơn thuốc đã kê** (bao gồm cả đơn cũ, không giới hạn thời gian), trực tiếp từ giao diện Lịch sử khám bệnh (`PrescriptionHistory.tsx`). 

Phạm vi chỉnh sửa:
- Số lượng thuốc (tăng/giảm)
- Xóa 1 thuốc khỏi đơn
- Thêm thuốc mới vào đơn
- Đổi thuốc (A → B)
- Chẩn đoán, ghi chú, ngày kê đơn

Hệ thống tự động đồng bộ kho thuốc khi thay đổi. Cho phép kho âm nhưng hiển thị cảnh báo.

## Tech Stack
- Frontend: React (Next.js), Vanilla CSS (existing), framer-motion
- Backend: Next.js Server Actions, Supabase RPC
- Database: PostgreSQL (Supabase)
- Validation: Zod

## Phases

| Phase | Name | Status | Tasks | Progress |
|-------|------|--------|-------|----------|
| 01 | Database — RPC `update_prescription` | ✅ Completed | 4 | 100% |
| 02 | Backend — Server Action + Validation | ✅ Completed | 5 | 100% |
| 03 | Frontend — Edit Dialog UI | ✅ Completed | 8 | 100% |
| 04 | Integration & Testing | ✅ Completed | 5 | 100% |

**Tổng:** 22 tasks | Ước tính: 2-3 sessions

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
