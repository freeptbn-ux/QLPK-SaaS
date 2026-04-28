# Plan: Chỉnh sửa bảng bệnh nhân (Định dạng ngày sinh + Ẩn cột)

Created: 2026-04-28 20:01
Status: 🟡 In Progress

## Overview

Thay đổi giao diện bảng danh sách bệnh nhân tại `/patients`:
1. **Định dạng ngày sinh**: Chuyển cột "Ngày sinh" từ dạng raw (YYYY-MM-DD) sang hiển thị `DD/MM/YYYY`
2. **Ẩn cột không cần thiết**: Bỏ hiển thị cột "Địa chỉ" và "Giới tính" trên cả Desktop table và Mobile cards

> **Lưu ý:** Đây là thay đổi UI-only, KHÔNG ảnh hưởng đến database hay API.

## Tech Stack
- Frontend: Next.js (React) + TypeScript

## Scope ảnh hưởng

| File | Mục đích thay đổi |
|------|-------------------|
| `src/lib/utils/date.ts` | Thêm hàm `formatDob()` để format ngày sinh DD/MM/YYYY |
| `src/components/features/patients/PatientListClient.tsx` | Xóa cột Địa chỉ + Giới tính, dùng `formatDob()` cho Ngày sinh |

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Thêm hàm format ngày sinh | ⬜ Pending | 0% |
| 02 | Cập nhật bảng bệnh nhân | ⬜ Pending | 0% |
| 03 | Kiểm tra & xác nhận | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
