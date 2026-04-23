# Phase 02: UI Refactor (Glassmorphism)
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Thay đổi layout phần Thanh toán và áp dụng phong cách thiết kế Glassmorphism cho Card.

## Requirements
- [x] Ẩn hai dòng "Tiền thuốc" và "Phí khám".
- [x] Card "Thanh toán" sử dụng hiệu ứng Glassmorphism (blur nền, border mỏng, shadow mịn).
- [x] Phần "Tổng cộng" được làm to hơn (font-size lớn) và màu sắc premium.
- [x] Nút "Lưu đơn thuốc" được chuyển sang kích thước `large`, có thể dùng gradient hoặc bóng đổ sâu để nổi bật.

## Implementation Steps
1. [x] Chỉnh sửa `src/components/features/prescriptions/PrescriptionForm.tsx`.
2. [x] Tạo `StyledCard` hoặc sử dụng `sx` prop của MUI để áp dụng hiệu ứng Glassmorphism.
3. [x] Xóa/Comment các đoạn mã hiển thị subtotal và consultation fee.
4. [x] Cập nhật style cho Typography "Tổng cộng".
5. [x] Cập nhật style cho Button "Lưu đơn thuốc".

## Test Criteria
- [ ] Giao diện đúng như mockup yêu cầu.
- [ ] Không còn hiển thị chi tiết phí.
- [ ] Nút Save trông nổi bật và dễ bấm.
