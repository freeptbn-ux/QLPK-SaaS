# Phase 01: Security & Privacy Locking
Status: ✅ Completed (2026-05-10)
Dependencies: None

## Objective
Ngăn chặn ngay lập tức việc rò rỉ dữ liệu giữa các phòng khám và chặn quyền truy cập trái phép từ bên ngoài vào các hàm nhạy cảm.

## Requirements
### Functional
- [x] Chỉnh sửa các hàm SQL Thống kê (Statistics) để chỉ trả về dữ liệu của đúng phòng khám (clinic_id).
- [x] Thu hồi quyền thực thi hàm (EXECUTE) đối với người dùng chưa đăng nhập (anon role).

### Security
- [x] Đảm bảo RLS (Row-Level Security) được áp dụng triệt để trong các hàm RPC.
- [x] Chỉ cho phép vai trò `authenticated` gọi các hàm nghiệp vụ.

## Implementation Steps
1. [x] **Update Statistics RPCs**: Duyệt qua các file trong `supabase/migrations/008_statistics_rpcs.sql` và thêm bộ lọc `clinic_id = get_my_clinic_id()`.
2. [x] **Revoke Public Access**: Tạo migration mới để `REVOKE EXECUTE ... FROM anon` cho các hàm:
    - `get_revenue_stats`
    - `get_stats_by_day_for_month`
    - `get_stats_by_location`
    - `create_prescription`, `update_prescription`, `delete_prescription`
3. [x] **Verification**: Kiểm tra thử gọi hàm bằng key ẩn danh để đảm bảo bị từ chối.

## Files to Create/Modify
- `supabase/migrations/20260510_fix_stats_rls.sql` - Thêm clinic_id filter.
- `supabase/migrations/20260510_restrict_anon_access.sql` - Chặn quyền anon.

## Test Criteria
- [x] Dùng postman/curl gọi hàm stats mà không có JWT -> Phải trả về lỗi 401/403.
- [x] Đăng nhập tài khoản Clinic A -> Không được thấy doanh thu của Clinic B.

---
Next Phase: [Phase 02: Data Integrity](./phase-02-data-integrity.md)
