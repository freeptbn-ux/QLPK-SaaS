# Phase 02: Fix Mobile Quantity Input

## Objective
Đảm bảo ô input Số lượng (SL) hiển thị rõ ràng con số trên giao diện mobile (đặc biệt ở view Chỉnh sửa đơn thuốc), người dùng có thể chạm vào và sửa dễ dàng.

## Tasks
- [x] Mở file `src/components/features/prescriptions/PrescriptionItemRow.tsx`.
- [x] Tìm thẻ `<input type="number">` của trường số lượng (quantity).
- [x] Thêm class CSS tiện ích của Tailwind để ẩn spin buttons đi: `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`.
- [x] Điều chỉnh lại padding cho mobile: sửa `px-2` thành `px-1 sm:px-2`.
- [x] Review lại thẻ `<td>` bọc ngoài, có thể set thêm `max-w-[80px]` để giữ layout không bị vỡ.

## Files
- `src/components/features/prescriptions/PrescriptionItemRow.tsx`

## Test
- [x] Mở giao diện "Sửa đơn thuốc #XXX" trên Chrome DevTools (bật chế độ giả lập mobile - iPhone 12/13).
- [x] Kiểm tra cột SL xem số có hiện rõ không, có bị mất do icon spin button chèn vào không.
- [x] Bấm vào sửa số lượng xem có thao tác được như bình thường không.