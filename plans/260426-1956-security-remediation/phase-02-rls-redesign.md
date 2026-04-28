# Phase 02: RLS Redesign
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Thiết kế lại hệ thống Row Level Security (RLS) để thắt chặt quyền truy cập, thay thế chính sách "mở toang" hiện tại (`USING (true)`).

## Requirements
### Security
- [x] Mỗi bảng chỉ cho phép truy cập/sửa đổi bởi user hợp lệ.
- [x] Giới hạn quyền theo role (Admin/Doctor/Staff) hoặc tenant (clinic_id) thay vì chỉ kiểm tra `authenticated`.

## Implementation Steps
1. [x] Viết migration mới để xóa bỏ các policy `USING (true)` trên bảng `patients`, `medicines`, `prescriptions_header`, `prescription_details`, `settings`.
2. [x] Thêm các RLS policy mới yêu cầu kiểm tra user ID hoặc role (Ví dụ: `auth.uid() = ...` hoặc gọi function check role).
3. [x] (Tuỳ chọn) Thiết lập cấu trúc phân quyền (Role-based) cho user.

## Files to Create/Modify
- `supabase/migrations/YYYYMMDD_fix_rls_policies.sql` - Migration script mới.

## Test Criteria
- [ ] Thử truy vấn dữ liệu bằng token của một user không có quyền -> trả về rỗng hoặc báo lỗi.

---
Next Phase: Phase 03 (App Authorization)
