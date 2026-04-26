# Phase 02: Frontend UI
Status: ✅ DONE
Dependencies: Phase 01

## Objective
Cập nhật giao diện `PrescriptionHistory.tsx` để bổ sung nút Xóa từng đơn thuốc, kèm theo hộp thoại xác nhận (Confirm Dialog) an toàn trước khi xóa.

## Requirements
### Functional
- [x] Hiển thị nút "Xóa đơn" (biểu tượng thùng rác màu đỏ) tại mỗi card đơn thuốc trong Lịch sử khám bệnh.
- [x] Khi click, hiển thị một Modal Confirm: "Bạn có chắc chắn muốn xóa đơn thuốc ngày [DD/MM/YYYY] không? Các dữ liệu thuộc đơn này sẽ bị mất."
- [x] Gọi hàm Server Action `deletePrescription` đã tạo ở Phase 01.
- [x] Hiển thị trạng thái loading khi đang xóa.
- [x] Cập nhật danh sách đơn thuốc sau khi xóa thành công (có thể xóa khỏi state `prescriptions` để UI cập nhật ngay mà không cần reload trang).

### Non-Functional
- [x] Nút xóa phải rõ ràng nhưng không dễ bấm nhầm.
- [x] Dialog confirm phải nằm đúng trên top (z-index) và có nút Hủy.
- [x] Có thông báo Toast hoặc alert ngắn gọn khi xóa thành công.

## Implementation Steps
1. [x] Thêm state cho Delete Confirmation Dialog vào `PrescriptionHistory.tsx` (ví dụ: `deletingPrescriptionId`, `isDeleteDialogOpen`).
2. [x] Thêm nút "Xóa" vào flexbox chứa các nút "In đơn thuốc" và "Thêm thuốc" của mỗi đơn.
3. [x] Tạo modal xác nhận xóa sử dụng Framer Motion tương tự modal "Thêm thuốc".
4. [x] Viết hàm `handleDeleteConfirm` gọi server action, xử lý loading và xóa khỏi mảng state `prescriptions`.

## Files to Create/Modify
- `src/components/features/patients/PrescriptionHistory.tsx` - Sửa UI và thêm logic xử lý xóa.

## Test Criteria
- [x] Bấm nút xóa hiện dialog xác nhận.
- [x] Bấm Hủy trong dialog thì tắt dialog, không xóa.
- [x] Bấm Xóa trong dialog thì loading, sau đó thông báo thành công và đơn thuốc biến mất khỏi giao diện.
- [x] Nút xóa hoạt động với cả những đơn thuốc cũ vừa "Tải thêm".

---
Next Phase: Hoàn thành!
