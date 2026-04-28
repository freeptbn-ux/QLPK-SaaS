# Phase 02: Testing & UI Polish
Status: ✅ DONE
Dependencies: Phase 01

## Objective
Kiểm tra tính năng đã code ở Phase 01, đồng thời làm mượt (polish) UI và fix các bug tiềm ẩn.

## Implementation Steps
1. [ ] Khởi động project locally.
2. [ ] Truy cập vào màn hình Dashboard Bệnh nhân, click mở "Lịch sử dùng thuốc".
3. [ ] Test bấm vào "Tên thuốc": Click 1 lần, 2 lần, 3 lần để chắc chắn việc sort đổi hướng hoặc hủy đúng mong muốn.
4. [ ] Test bấm vào "Số lần" tương tự.
5. [ ] Đảm bảo giao diện không bị xê dịch hay giật (layout shift) khi các mũi tên xuất hiện hoặc đổi hướng (gợi ý: sử dụng chiều rộng cột cố định hoặc thiết kế icon chung không gian).
6. [ ] Xác nhận giao diện hiển thị ổn trên màn hình điện thoại (mobile).

## Files to Create/Modify
- `src/components/features/patients/MedicineUsageDialog.tsx` (Chỉ chỉnh sửa nếu có lỗi UI/UX cần fix trong lúc test).

## Test Criteria
- [ ] Tính năng sắp xếp chạy chuẩn xác.
- [ ] UI không bị vỡ layout, các mũi tên hiển thị đẹp mắt, hợp logic UI.
- [ ] Không có báo lỗi về Hydration hay TypeScript trong console.

---
Next Phase: Hoàn thành!
