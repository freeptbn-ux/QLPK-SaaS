# Phase 01: Critical DB & Repo Fixes
Status: ⬜ Pending
Dependencies: None

## Objective
Xử lý ngay lập tức các lỗ hổng nguy hiểm nhất: thu hồi quyền thực thi RPC từ `anon`, vô hiệu hóa API chạy migration từ Frontend và xóa dữ liệu nhạy cảm (PII) khỏi repo.

## Requirements
### Security
- [ ] Hàm RPC không được phép gọi bởi người dùng chưa đăng nhập (`anon`).
- [ ] Không cho phép chạy migration trực tiếp từ UI/Client.
- [ ] Xóa bỏ toàn bộ file dump dữ liệu chứa thông tin thật của bệnh nhân khỏi Git history / Workspace.

## Implementation Steps
1. [ ] Sửa file migration `011_grant_rpc_permissions.sql` và các file liên quan: thay thế `GRANT EXECUTE ON ALL FUNCTIONS... TO anon` thành chỉ cấp quyền cho `authenticated`.
2. [ ] Sửa đổi các hàm RPC sử dụng `SECURITY DEFINER` để thêm kiểm tra quyền hoặc chuyển sang `SECURITY INVOKER`.
3. [ ] Xóa hoặc vô hiệu hóa file `src/actions/system.ts` (API `runDatabaseMigration`), gỡ bỏ nút gọi từ `SettingsForm.tsx`.
4. [ ] Xóa các file `.sql` trong thư mục `Supabase Database/` chứa dữ liệu thật (patients_rows, prescriptions, v.v.).

## Files to Create/Modify
- `supabase/migrations/011_grant_rpc_permissions.sql` - Thu hồi quyền anon.
- `src/actions/system.ts` - Vô hiệu hóa migration runner.
- `src/components/features/settings/SettingsForm.tsx` - Xóa UI gọi migration.
- `Supabase Database/*.sql` - Xóa các file chứa PII.

## Test Criteria
- [ ] Gọi thử RPC từ client khi chưa đăng nhập -> bị từ chối.
- [ ] Chức năng chạy migration trên giao diện đã biến mất.

---
Next Phase: Phase 02 (RLS Redesign)
