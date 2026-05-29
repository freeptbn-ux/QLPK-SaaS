# Plan: Fix Dose Calculator Sample Drugs Loading
Created: 2026-05-29 17:40
Status: 🟡 In Progress

## Overview
Khắc phục sự cố công cụ "Tính liều thuốc" không tải được danh mục thuốc mẫu từ cơ sở dữ liệu. Lỗi xảy ra do trang `DoseCalculatorPage` là Server Component nhưng chưa lấy dữ liệu từ action `getDrugPresets()` để truyền vào prop `presets` của component con `<DoseCalculator />`.

## Goals
1. **Đồng bộ hóa dữ liệu**: Lấy danh sách thuốc mẫu từ Supabase thông qua server action `getDrugPresets()`.
2. **Khắc phục lỗi hiển thị**: Truyền prop `presets` cho `<DoseCalculator />` để dropdown `<select>` hiển thị đầy đủ danh sách thuốc đã cấu hình trong mục "Quản lý thuốc mẫu".
3. **Đảm bảo tính chính xác**: Xác minh tính năng tính liều hoạt động đúng với các thông số tự động được điền từ thuốc mẫu đã chọn.

## Tech Stack
- Framework: Next.js (App Router, Server Components)
- State/Database: Supabase (via Server Actions)
- Components:
  - `src/app/(dashboard)/dose-calculator/page.tsx`
  - `src/components/features/dose-calculator/DoseCalculator.tsx`

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Load Presets in Server Component | ⬜ Pending | 0% |
| 02 | Verification & Testing | ⬜ Pending | 0% |

## Quick Commands
- Bắt đầu Phase 1: `/code phase-01`
- Kiểm tra tiến độ: `/next`
- Lưu context: `/save-brain`
