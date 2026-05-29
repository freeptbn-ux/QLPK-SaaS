# Plan: Highlight and Disable Out-of-Stock Medicines
Created: 2026-05-11 12:24
Status: ✅ Completed

## Overview
Cải thiện trải nghiệm người dùng trong form kê đơn bằng cách hiển thị rõ ràng các thuốc đã hết hàng (tồn kho = 0). Các thuốc này sẽ được tô đỏ tên và người dùng không thể chọn để thêm vào đơn thuốc.

## Goals
1. **Trực quan hóa**: Tên thuốc có tồn kho = 0 sẽ hiển thị màu đỏ trong danh sách gợi ý (Autocomplete).
2. **Ngăn chặn lỗi**: Không cho phép chọn (click hoặc nhấn Enter) các thuốc đã hết hàng.
3. **Thông tin rõ ràng**: Giữ nguyên hiển thị số lượng tồn kho để bác sĩ biết tình trạng kho.

## Tech Stack
- Frontend: React (Next.js App Router)
- UI: Tailwind CSS
- Component: MedicineAutocomplete.tsx

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | UI Enhancement | ✅ Completed | 100% |
| 02 | Selection Logic | ✅ Completed | 100% |
| 03 | UX Polish & Testing | ✅ Completed | 100% |

## Quick Commands
- Bắt đầu Phase 1: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu context: `/save-brain`
