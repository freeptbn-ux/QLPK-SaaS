# Phase 01: Fix DateInput Focus Jump

## Objective
Ngăn chặn hiện tượng con trỏ tự động nhảy sang ô "Năm" khi người dùng click vào ô "Ngày" hoặc "Tháng" để chỉnh sửa.

## Tasks
- [x] Mở file `src/components/ui/DateInput.tsx`.
- [x] Tìm đến các thẻ `<input>` của `dayRef`, `monthRef`, `yearRef`.
- [x] Thêm event `onClick={(e) => e.stopPropagation()}` vào cả 3 thẻ `<input>` này để ngăn sự kiện click nổi bọt (bubble up) lên thẻ div cha.
- [x] (Optional) Cập nhật logic `onClick` của thẻ div cha (dòng 84) để kiểm tra `if (e.target === e.currentTarget)` trước khi trigger logic focus. (Lưu ý: Đã tối ưu bằng cách bỏ qua input thay vì kiểm tra currentTarget để hỗ trợ click vào separator).

## Files
- `src/components/ui/DateInput.tsx`

## Test
- [x] Nhập đầy đủ 1 ngày sinh hợp lệ (VD: 15/08/1990).
- [x] Dùng chuột click vào ô "15" (ngày), con trỏ phải ở lại ô ngày, không được nhảy sang ô năm.
- [x] Dùng chuột click vào khoảng trắng giữa các ô (khoảng phân cách `/`), focus sẽ tự động nhảy vào ô trống đầu tiên (nếu có) hoặc ô năm (nếu đã điền đủ).