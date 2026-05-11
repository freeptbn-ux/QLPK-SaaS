# Phase 01: UI Enhancement
Status: ✅ Completed
Dependencies: None

## Objective
Cập nhật giao diện của `MedicineAutocomplete` để phân biệt thuốc hết hàng và thuốc còn hàng.

## Requirements
- [x] Xác định điều kiện thuốc hết hàng (`stock_quantity === 0`).
- [x] Áp dụng màu đỏ (`text-red-500` hoặc tương đương) cho tên thuốc khi hết hàng.
- [x] Thêm chỉ báo "Hết hàng" hoặc làm mờ nhẹ item để tăng độ nhận diện.

## Implementation Steps
1. Chỉnh sửa file `src/components/features/prescriptions/MedicineAutocomplete.tsx`.
2. Tìm đoạn code render item trong danh sách (li/button).
3. Thêm logic class CSS dựa trên `option.stock_quantity`.

## Files Modified
- `src/components/features/prescriptions/MedicineAutocomplete.tsx`
- `src/components/features/prescriptions/__tests__/MedicineAutocomplete.test.tsx` (Added)

## Test Results
- [x] Mở form kê đơn, gõ tìm thuốc đã biết là hết hàng.
- [x] Kiểm tra xem tên thuốc có hiện màu đỏ không.
- [x] Kiểm tra xem số lượng tồn kho vẫn hiển thị đúng.
- [x] Đã chạy unit test `MedicineAutocomplete.test.tsx` thành công.
