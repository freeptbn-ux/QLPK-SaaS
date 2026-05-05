# Phase 02: Kiểm tra và đồng bộ hóa UI với Kê đơn mới

Status: ✅ Completed
Dependencies: Phase 01

## Objective
Đảm bảo trải nghiệm người dùng (UX) đồng bộ giữa việc kê đơn mới và sửa đơn cũ, đặc biệt là phần hiển thị số lượng và tính toán tổng tiền khi đang sửa.

## Requirements
### Functional
- [ ] Đảm bảo tổng tiền được cập nhật đúng khi số lượng đang là 0 (hoặc trống).
- [ ] Kiểm tra xem có cần thêm placeholder hoặc tooltip hướng dẫn không.

## Implementation Steps
1. [ ] Kiểm tra logic tính tổng tiền trong modal Sửa đơn (thường là `item.quantity * item.unit_price`).
2. [ ] Đảm bảo UI không bị vỡ khi số lượng trống.
3. [ ] Đối chiếu với `PrescriptionForm.tsx` để xem có class CSS hay hiệu ứng nào hay ho mà modal Sửa đơn đang thiếu không.

## Files to Create/Modify
- `src/components/features/patients/PrescriptionHistory.tsx` - Đồng bộ UI/UX.

## Test Criteria
- [ ] Trải nghiệm nhập liệu ở cả 2 nơi (Mới/Cũ) phải giống hệt nhau về cảm giác.
