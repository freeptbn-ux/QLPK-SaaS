# Phase 03: Audit Trail & Compliance
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Xây dựng hệ thống giám sát thay đổi (Audit Log) để đáp ứng các tiêu chuẩn pháp lý y tế và giúp truy vết khi có sự cố.

## Requirements
### Functional
- [x] Tạo bảng `audit_logs` để lưu vết mọi thao tác: INSERT, UPDATE, DELETE.
- [x] Tự động ghi lại: Ai sửa? Sửa bảng nào? Giá trị cũ là gì? Giá trị mới là gì? Lúc nào?

### Compliance
- [x] Dữ liệu nhật ký phải được bảo vệ, không cho phép xóa hoặc sửa.
- [x] Áp dụng cho các bảng cốt lõi: `patients`, `prescriptions_header`, `medicines`.

- [x] Thiết lập bảng `audit_logs` ở chế độ "Append-only" (chỉ thêm, không cho sửa/xóa).

## Implementation Steps
1. [x] **Create Audit Schema**: Tạo bảng `audit_logs` với các trường: `clinic_id`, `user_id`, `table_name`, `operation`, `old_values`, `new_values`.
2. [x] **Implement Immutability**: Sử dụng PostgreSQL Trigger hoặc RLS để chặn đứng mọi lệnh `DELETE` và `UPDATE` lên bảng `audit_logs`.
3. [x] **Create Global Trigger**: Viết một hàm trigger chung trong PostgreSQL để tự động bắt các sự kiện thay đổi dữ liệu.
4. [x] **Attach Triggers**: Gán trigger này vào các bảng mục tiêu.
5. [x] **Protect Logs**: Thiết lập RLS cho bảng `audit_logs` để chỉ Admin hoặc hệ thống mới có quyền ghi, không ai được xóa.

## Files to Create/Modify
- `supabase/migrations/20260510_setup_audit_trail.sql` - Toàn bộ cấu trúc nhật ký.

## Test Criteria
- [x] Sửa giá trị thuốc -> Kiểm tra bảng `audit_logs` có dòng log tương ứng không.
- [x] Xóa một đơn thuốc -> Kiểm tra log có ghi lại nội dung đơn thuốc trước khi xóa không.

---
Next Steps: Kiểm tra tổng thể và bàn giao.
