# Phase 01: Database Migration
Status: ⬜ Pending
Dependencies: None

## Objective
Tạo và áp dụng migration mới để chuyển đổi các hàm `get_my_role()` và `get_my_clinic_id()` từ `LANGUAGE sql` sang `LANGUAGE plpgsql`.

## Requirements
### Functional
- [x] Chuyển `get_my_role()` sang `plpgsql`
- [x] Chuyển `get_my_clinic_id()` sang `plpgsql`
- [x] Đảm bảo giữ nguyên thuộc tính `STABLE SECURITY DEFINER SET search_path = public`

### Non-Functional
- [ ] Tránh inlining functions trong PostgreSQL planner để chặn đệ quy RLS.

## Implementation Steps
1. [x] Tạo file migration mới: `supabase/migrations/20260428095700_fix_rls_recursion_plpgsql.sql`
2. [x] Viết script SQL định nghĩa lại 2 hàm theo `Giải pháp A` trong file phân tích.
3. [ ] Chạy migration lên cơ sở dữ liệu Supabase. (Hệ thống MCP đang ở chế độ Read-only cho DDL, cần user hỗ trợ chạy)

## Files to Create/Modify
- `supabase/migrations/[timestamp]_fix_rls_recursion_plpgsql.sql` - Migration script

## Test Criteria
- [ ] Chạy lệnh push migration thành công.
- [ ] Kiểm tra function type trong database đã cập nhật thành `plpgsql`.

## Notes
Đây là bước fix quan trọng và triệt để nhất cho lỗi RLS.

---
Next Phase: phase-02-testing.md
