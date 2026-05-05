# Phase 01: UI Fixes & Browser Compatibility
Status: ✅ Completed
Dependencies: None

## Objective
Sửa lỗi không nhập được số âm trên Firefox bằng cách thay đổi cơ chế xử lý Input trong `StockAdjustDialog.tsx`.

## Requirements
### Functional
- [x] Cho phép nhập dấu `-` và số âm trong ô "Số lượng điều chỉnh".
- [x] Đảm bảo giá trị trả về server luôn là số nguyên (integer).
- [x] Loại bỏ dấu `+` tự động gây nhiễu UI khi giá trị là 0 hoặc dương.

### Non-Functional
- [x] Tương thích 100% trên Firefox, Chrome, Safari.
- [x] Không gây lỗi crash app khi người dùng nhập ký tự lạ.

## Implementation Steps
1. [x] Đọc file `src/components/features/medicines/StockAdjustDialog.tsx`.
2. [x] Refactor state `adjustment` để hỗ trợ giá trị chuỗi trung gian (giúp gõ dấu `-`).
3. [x] Cập nhật logic `onChange` sử dụng Regex: `/^-?\d*$/`.
4. [x] Xóa logic hiển thị dấu `+` tại dòng 95 (hoặc tương đương).
5. [x] Kiểm tra lại hàm `onSubmit` để đảm bảo parsing dữ liệu chuẩn.

## Files to Create/Modify
- `src/components/features/medicines/StockAdjustDialog.tsx` - Sửa logic input.

## Test Criteria
- [x] Mở dialog trên Firefox, gõ dấu `-` thành công.
- [x] Gõ `-5`, nút lưu hoạt động và cập nhật đúng tồn kho (giảm 5).
- [x] Gõ ký tự chữ cái -> input không nhận.

---
Next Phase: [Phase 02: Database & Security Hardening](phase-02-db-security.md)
