# Plan: Sửa lỗi UX khi sửa số lượng thuốc (SL)
Created: 2026-05-05 09:51
Status: ✅ Completed

## Overview
Người dùng gặp vấn đề UX khi sửa số lượng thuốc trong cửa sổ "Sửa đơn thuốc". Khi xóa hết số trong ô nhập liệu, giá trị tự động quay về 1 thay vì để trống, gây khó khăn cho việc nhập số mới (phải xóa số 1 đi). Vấn đề nằm ở hàm `handleEditUpdateQuantity` trong `PrescriptionHistory.tsx` đang sử dụng `Math.max(1, quantity)`.

## Tech Stack
- React (Next.js)
- TypeScript
- TailwindCSS

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Sửa logic cập nhật số lượng trong PrescriptionHistory | ✅ Completed | 100% |
| 02 | Kiểm tra và đồng bộ hóa UI với Kê đơn mới | ✅ Completed | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
