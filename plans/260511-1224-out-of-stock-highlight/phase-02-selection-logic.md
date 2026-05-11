# Phase 02: Selection Logic
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Ngăn chặn người dùng chọn các thuốc đã hết hàng trong danh sách.

## Requirements
- [x] Vô hiệu hóa sự kiện click vào item hết hàng.
- [x] Ngăn chặn việc chọn item bằng phím Enter nếu item đó đang được focus nhưng hết hàng.
- [x] Cập nhật cursor (con trỏ chuột) thành `not-allowed` cho các item hết hàng.

## Implementation Steps
1. Cập nhật `handleSelect` trong `MedicineAutocomplete.tsx` để check stock trước khi thực hiện logic chọn.
2. Cập nhật `handleKeyDown` để bỏ qua sự kiện `Enter` nếu item đang chọn có `stock_quantity === 0`.
3. Thêm thuộc tính `disabled` hoặc class CSS `pointer-events-none` (kèm lưu ý về UX) cho button.

## Files to Modify
- `src/components/features/prescriptions/MedicineAutocomplete.tsx`

## Test Criteria
- [ ] Thử click vào thuốc màu đỏ, kiểm tra xem nó có được thêm vào đơn không (kỳ vọng: không).
- [ ] Thử dùng phím mũi tên và phím Enter để chọn thuốc màu đỏ, kiểm tra xem nó có được thêm vào đơn không (kỳ vọng: không).
