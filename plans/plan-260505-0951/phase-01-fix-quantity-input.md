# Phase 01: Sửa logic cập nhật số lượng trong PrescriptionHistory

Status: ✅ Completed
Dependencies: None

## Objective
Loại bỏ việc ép giá trị tối thiểu là 1 ngay trong lúc người dùng đang nhập liệu tại modal "Sửa đơn thuốc", giúp người dùng có thể xóa trắng ô nhập để điền số mới một cách tự nhiên.

## Requirements
### Functional
- [ ] Cho phép ô nhập số lượng (SL) trống khi người dùng xóa hết ký tự.
- [ ] Khi ô trống, giá trị ngầm định trong state nên là 0 (để UI hiển thị trống).
- [ ] Đảm bảo khi lưu, nếu số lượng là 0 hoặc trống thì hệ thống vẫn xử lý đúng (thường là chặn lưu hoặc mặc định về 1 lúc submit).

## Implementation Steps
1. [x] Mở file `src/components/features/patients/PrescriptionHistory.tsx`.
2. [x] Tìm hàm `handleEditUpdateQuantity`.
3. [x] Loại bỏ `Math.max(1, quantity)` để cho phép giá trị 0.
4. [x] Kiểm tra modal "Thêm thuốc" (Append Dialog) để đảm bảo tính nhất quán (nếu cần).
5. [x] Kiểm tra hàm submit `handleEditSubmit` để đảm bảo không lưu đơn thuốc có số lượng <= 0 (thêm validation nếu thiếu).

## Files to Create/Modify
- `src/components/features/patients/PrescriptionHistory.tsx` - Sửa logic `handleEditUpdateQuantity` và validation submit.

## Test Criteria
- [x] Mở modal "Sửa đơn".
- [x] Chọn một loại thuốc, xóa số lượng hiện tại -> Ô nhập phải trống, không tự nhảy về 1.
- [x] Nhập số mới (ví dụ 5) -> Phải hoạt động bình thường.
- [x] Thử xóa hết và nhấn "Lưu" -> Phải báo lỗi hoặc không cho phép lưu với SL = 0.

---
Next Phase: [Phase 02: Kiểm tra và đồng bộ hóa UI với Kê đơn mới]
