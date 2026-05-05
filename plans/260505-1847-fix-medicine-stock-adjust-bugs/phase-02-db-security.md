# Phase 02: Database & Security Hardening
Status: ✅ Completed
Dependencies: [Phase 01](phase-01-ui-fixes.md)

## Objective
Thực hiện các đề xuất từ Supabase Advisor để thắt chặt bảo mật và tối ưu hiệu năng database.

## Requirements
### Security
- [x] Thu hồi quyền thực thi (`REVOKE EXECUTE`) hàm `adjust_medicine_stock` từ role `anon`.
- [x] Đảm bảo chỉ role `authenticated` mới có thể gọi hàm này.

### Performance
- [x] Kiểm tra tình trạng index `medicines_name_idx`.
- [x] Xóa index nếu thực sự không sử dụng hoặc cập nhật query để tận dụng index này. (Đã kiểm tra: Index `medicines_name_idx` không tồn tại, chỉ có `medicines_name_key` đang được sử dụng tốt).

## Implementation Steps
1. [x] Sử dụng `mcp_supabase_execute_sql` để chạy lệnh `REVOKE` và `GRANT`.
2. [x] Kiểm tra định nghĩa hàm RPC để xác nhận các check `auth.uid()` bên trong.
3. [x] Phân tích các câu query tìm kiếm thuốc trong mã nguồn.
4. [x] Thực hiện lệnh SQL để xóa hoặc sửa index `medicines_name_idx`. (Kết quả: Không cần xóa vì không tồn tại index rác).

## SQL Commands (Applied)
```sql
-- Security Hardening
REVOKE EXECUTE ON FUNCTION public.adjust_medicine_stock(bigint, integer, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.adjust_medicine_stock(bigint, integer, text) TO authenticated;

-- Performance Optimization
-- (Checked: medicines_name_idx does not exist, medicines_name_key is active)
```

## Test Criteria
- [x] Thử gọi RPC từ client không đăng nhập -> Bị từ chối.
- [x] Kiểm tra bảng `medicines` -> Index đã được xử lý.

---
Next Phase: [Phase 03: Verification & Polish](phase-03-verification.md)
