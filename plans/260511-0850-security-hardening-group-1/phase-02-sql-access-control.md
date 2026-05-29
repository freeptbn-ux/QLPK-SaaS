# Phase 02: SQL Access Control (Khóa quyền người lạ)
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Thu hồi toàn bộ quyền thao tác dữ liệu của người dùng chưa đăng nhập (`anon`) thông qua API Supabase.

## Requirements
### Functional
- [x] API Supabase chỉ cho phép người dùng đã đăng nhập (`authenticated`) thao tác dữ liệu.
- [x] Bật RLS cho bảng `clinics`.

### Security
- [x] Chặn mọi quyền INSERT/UPDATE/DELETE/SELECT của role `anon` trên toàn bộ schema public.

## Implementation Steps
1. [x] **Tạo Migration thu hồi quyền:** Viết file SQL dùng lệnh `REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;`.
2. [x] **Kích hoạt RLS cho bảng clinics:** Chạy lệnh `ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;`.
3. [x] **Tạo Policy cho clinics:** Chỉ cho phép người dùng thuộc clinic đó mới được xem thông tin clinic.
4. [x] **Triển khai:** Chạy migration này lên database.

## Files to Create/Modify
- `supabase/migrations/20260511_emergency_revoke_anon.sql` - File migration mới.

## Test Criteria
- [ ] Sử dụng Supabase Client (không đăng nhập) thử truy cập dữ liệu -> Phải nhận lỗi "Permission Denied".
- [ ] Đăng nhập vào app -> Vẫn xem được dữ liệu bình thường.

---
Next Phase: [Phase 03: Cleanup Infrastructure](phase-03-cleanup-infrastructure.md)
