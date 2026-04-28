# Phase 03: Kiểm tra & xác nhận

Status: ⬜ Pending
Dependencies: Phase 01, Phase 02

## Objective

Kiểm tra visual trên trình duyệt để đảm bảo mọi thay đổi hoạt động đúng.

## Checklist

### Functional
- [ ] Truy cập `http://localhost:3000/patients`
- [ ] Desktop: Bảng chỉ còn 6 cột: STT, Họ tên, Ngày sinh, SĐT, Khám gần nhất, Thao tác
- [ ] Desktop: Ngày sinh hiển thị đúng dạng DD/MM/YYYY
- [ ] Desktop: Dòng không có ngày sinh hiển thị "N/A"
- [ ] Mobile: Card hiển thị ngày sinh DD/MM/YYYY thay vì giới tính
- [ ] Tìm kiếm bệnh nhân vẫn hoạt động
- [ ] Pagination (chuyển trang) vẫn hoạt động
- [ ] Click "Xem chi tiết" vẫn hoạt động
- [ ] Click "Chỉnh sửa" vẫn hoạt động

### Non-regression
- [ ] Trang `/patients/[id]` (chi tiết bệnh nhân) không bị ảnh hưởng
- [ ] Form thêm/sửa bệnh nhân vẫn có đủ trường Giới tính + Địa chỉ
- [ ] Không có lỗi console trong DevTools

## Notes
- Nếu phát hiện lỗi → quay lại Phase 02 để fix
- Sau khi pass hết checklist → đánh dấu plan.md là ✅ Complete

---
End of plan.
