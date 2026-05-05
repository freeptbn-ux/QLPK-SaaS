# Phase 02: Fix Medicine List Row Borders
Status: ✅ Completed
Dependencies: None

## Objective
Cải thiện độ hiển thị của các đường kẻ giữa các dòng trong danh sách thuốc (Kho thuốc) trong Dark Mode.

## Analysis
- File: `src/components/features/medicines/MedicineList.tsx`
- Vấn đề: `divide-slate-800` có màu gần như trùng với background `surface-dark` (#1e293b), dẫn đến các đường kẻ bị mờ hoặc không thấy.
- Giải pháp: Tăng độ sáng của border trong Dark Mode (ví dụ: dùng `dark:divide-slate-700` hoặc `dark:divide-slate-600`).

## Tasks
- [ ] Chỉnh sửa `src/components/features/medicines/MedicineList.tsx`
- [ ] Cập nhật class `divide-slate-100 dark:divide-slate-800` thành màu có độ tương phản cao hơn.
- [ ] Kiểm tra các border khác trong bảng (thead border-b).

## Files to Modify
- `src/components/features/medicines/MedicineList.tsx`

## Test Criteria
- [ ] Trong Dark Mode, các dòng trong bảng thuốc phải có đường kẻ phân cách rõ ràng.
- [ ] Phần header của bảng cũng phải có đường kẻ phân cách với body rõ ràng.
