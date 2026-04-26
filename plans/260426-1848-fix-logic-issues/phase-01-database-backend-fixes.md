# Phase 01: Database & Backend Fixes
Status: ✅ Completed
Dependencies: None

## Objective
Sửa lỗi logic trong các RPC của cơ sở dữ liệu và xử lý bảo mật cơ bản (escaping) ở tầng backend.

## Requirements
### Functional
- [x] Hàm `get_patient_dobs_by_time` phải hỗ trợ tham số `'all'` để trả về dữ liệu đúng cho biểu đồ thống kê theo tuần/tháng/năm.
- [x] Các tham số tìm kiếm bệnh nhân chứa ký tự đặc biệt (`%`, `_`) phải được escape để tránh lỗi query.

### Non-Functional
- [ ] Security: Chống SQL Injection / Wildcard Attack qua thanh tìm kiếm.

## Implementation Steps
1. [x] Cập nhật RPC `get_patient_dobs_by_time` trong Supabase để xử lý trường hợp `p_filter_type = 'all'`.
2. [x] Viết hàm tiện ích escape ký tự đặc biệt cho tìm kiếm (`LIKE` pattern).
3. [x] Áp dụng hàm escape vào action `src/actions/patients.ts`.

## Files to Create/Modify
- `supabase/migrations/20260426185000_fix_statistics_rpc_all.sql` - Cập nhật RPC.
- `src/lib/utils/string.ts` (hoặc tương tự) - Hàm escape wildcard.
- `src/actions/patients.ts` - Áp dụng escape vào query.

## Test Criteria
- [x] Biểu đồ độ tuổi hiển thị dữ liệu bình thường khi chọn filter Tuần/Tháng/Năm.
- [x] Tìm kiếm bệnh nhân với ký tự `%` không bị lỗi hoặc trả về toàn bộ danh sách sai lệch.

---
Next Phase: [Phase 02](phase-02-frontend-state-fixes.md)
