# Phase 03: App Authorization (RBAC)
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Kiểm tra session và phân quyền trực tiếp tại tầng Next.js Server Actions, đồng thời sửa lỗ hổng đổi mật khẩu.

## Requirements
### Security
- [ ] Mọi Server Actions thao tác dữ liệu đều phải gọi `supabase.auth.getUser()` để kiểm tra session hợp lệ.
- [ ] Phải xác thực mật khẩu cũ khi người dùng muốn đổi mật khẩu mới.
- [ ] Xóa bỏ "Dev Backdoor" trong luồng đăng nhập.

## Implementation Steps
1. [ ] Xóa đoạn code backdoor (`admin / 1`) trong `src/actions/auth.ts`.
2. [ ] Thêm `getUser()` vào đầu tất cả các hàm trong `src/actions/patients.ts`, `src/actions/prescriptions.ts`, `src/actions/settings.ts` để chặn request không hợp lệ.
3. [ ] Viết lại hàm `changePassword` trong `src/actions/settings.ts` để yêu cầu kiểm tra `currentPassword` (Sử dụng `signInWithPassword` để verify pass cũ trước khi gọi `updateUser`).
4. [ ] Khống chế các thiết lập hệ thống (`updateSetting`) bằng allowlist các key hợp lệ.

## Files to Create/Modify
- `src/actions/auth.ts`
- `src/actions/patients.ts`
- `src/actions/prescriptions.ts`
- `src/actions/settings.ts`

## Test Criteria
- [ ] Gọi Server Actions bằng cURL mà không có cookie -> bị chặn.
- [ ] Đổi mật khẩu thành công khi nhập đúng pass cũ, thất bại khi sai.

---
Next Phase: Phase 04 (Hardening)
