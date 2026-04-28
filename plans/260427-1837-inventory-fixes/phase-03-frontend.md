# Phase 03: Frontend Fixes
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Chỉnh sửa component UI (Dialog điều chỉnh tồn kho) để gửi lượng thay đổi (adjustment) thay vì tổng tồn kho mới, giải quyết hoàn toàn lỗi Race Condition ở phía client. Đồng thời cập nhật các thông điệp báo lỗi hoặc trạng thái loading phù hợp.

## Requirements
### Functional
- [x] Xoá đoạn code tính toán `const newQuantity = medicine.stock_quantity + adjustment;`.
- [x] Gửi tham số `adjustment` và tuỳ chọn `reason` (Lý do điều chỉnh) lên `updateMedicineStock` action.
- [x] Thêm input cho "Lý do điều chỉnh" (Reason) vào dialog `StockAdjustDialog.tsx` để cung cấp dữ liệu cho Audit Log.

### Non-Functional
- [x] UX: Hiển thị lỗi rõ ràng nếu server trả về lỗi (VD: "Số lượng kho không đủ").

## Implementation Steps
1. [x] Thêm State `reason` trong `StockAdjustDialog.tsx`.
2. [x] Sửa đổi UI thêm 1 Textarea hoặc Input để nhập lý do (không bắt buộc hoặc bắt buộc tuỳ logic, nên bắt buộc).
3. [x] Sửa `handleAdjust` gọi API với dạng `await updateMedicineStock(medicine.id, adjustment, reason)`.
4. [x] Xử lý error từ server trả về.

## Files to Create/Modify
- `src/components/features/medicines/StockAdjustDialog.tsx`

---
Next Phase: Hoàn thành Plan. Có thể tiến hành code theo lệnh `/code phase-01`.
