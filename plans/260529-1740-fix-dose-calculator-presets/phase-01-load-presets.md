# Phase 01: Load Presets in Server Component
Status: ✅ Completed
Dependencies: None

## Objective
Cập nhật trang `DoseCalculatorPage` để lấy dữ liệu thuốc mẫu từ Database và truyền vào component con `<DoseCalculator />`.

## Requirements
- [x] Chuyển component `DoseCalculatorPage` trong `src/app/(dashboard)/dose-calculator/page.tsx` thành `async` function.
- [x] Import `getDrugPresets` từ `@/actions/settings`.
- [x] Gọi `const presets = await getDrugPresets();` trước khi render component con.
- [x] Truyền `presets={presets}` vào component `<DoseCalculator />`.

## Implementation Steps
1. Mở file `src/app/(dashboard)/dose-calculator/page.tsx`.
2. Import `getDrugPresets` từ `@/actions/settings` (dòng 2: `import { getAllSettings, getDrugPresets } from '@/actions/settings';`).
3. Chỉnh sửa hàm `DoseCalculatorPage` thêm từ khóa `async`.
4. Gọi server action `getDrugPresets()` và gán vào biến `presets`.
5. Truyền `presets` vào `<DoseCalculator />` component ở dòng 24.

## Files to Create/Modify
- `src/app/(dashboard)/dose-calculator/page.tsx`

## Test Criteria
- [x] Trang `dose-calculator` tải bình thường mà không phát sinh lỗi Server Error.
- [x] Kiểm tra xem prop `presets` đã được lấy thành công từ Database chưa.
