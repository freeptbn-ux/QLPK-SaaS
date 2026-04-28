# Phase 03: App Authorization (RBAC)
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Kiểm tra session và phân quyền trực tiếp tại tầng Next.js Server Actions, đồng thời sửa lỗ hổng đổi mật khẩu.

## Requirements
### Security
- [x] Mọi Server Actions thao tác dữ liệu đều phải gọi `supabase.auth.getUser()` để kiểm tra session hợp lệ.
- [x] Phải xác thực mật khẩu cũ khi người dùng muốn đổi mật khẩu mới.
- [x] Xóa bỏ "Dev Backdoor" trong luồng đăng nhập.

## Implementation Steps
1. [x] Xóa đoạn code backdoor (`admin / 1`) trong `src/actions/auth.ts`.
2. [x] Thêm `getUser()` vào đầu tất cả các hàm trong `src/actions/patients.ts`, `src/actions/prescriptions.ts`, `src/actions/settings.ts` để chặn request không hợp lệ.
3. [x] Viết lại hàm `changePassword` trong `src/actions/settings.ts` để yêu cầu kiểm tra `currentPassword` (Sử dụng `signInWithPassword` để verify pass cũ trước khi gọi `updateUser`).
4. [x] Khống chế các thiết lập hệ thống (`updateSetting`) bằng allowlist các key hợp lệ.

## Files to Create/Modify
- `src/actions/auth.ts`
- `src/actions/patients.ts`
- `src/actions/prescriptions.ts`
- `src/actions/settings.ts`

## Test Criteria
- [x] Gọi Server Actions bằng cURL mà không có cookie -> bị chặn.
- [x] Đổi mật khẩu thành công khi nhập đúng pass cũ, thất bại khi sai.

---
Next Phase: Phase 04 (Hardening)
