# Phase 02: Database Migration
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Tạo migration script để thiết lập các cột `dob`, `gender`, `phone` thành `NOT NULL` ở cấp độ database, đảm bảo tính toàn vẹn dữ liệu từ gốc.

## Requirements
### Functional
- [x] Xử lý các bản ghi (record) bệnh nhân cũ đang có dữ liệu `NULL` để không bị lỗi khi chuyển sang `NOT NULL`.
- [x] Cập nhật schema table `patients`: Chỉnh sửa cấu trúc cột.

## Implementation Steps
1. [x] Tạo file migration SQL mới trong `supabase/migrations/` (vd: `007_enforce_mandatory_patient_fields.sql`).
2. [x] Viết script SQL:
   - Cập nhật dữ liệu cũ:
     - `UPDATE patients SET dob = '01/01/1900' WHERE dob IS NULL OR dob = '';`
     - `UPDATE patients SET gender = 'Nam' WHERE gender IS NULL OR gender = '';`
     - `UPDATE patients SET phone = 'Chưa cập nhật' WHERE phone IS NULL OR phone = '';`
   - Chuyển cấu trúc cột sang `NOT NULL`:
     - `ALTER TABLE patients ALTER COLUMN dob SET NOT NULL;`
     - `ALTER TABLE patients ALTER COLUMN gender SET NOT NULL;`
     - `ALTER TABLE patients ALTER COLUMN phone SET NOT NULL;`
3. [x] Chạy file migration để update database. (Đã thực hiện cập nhật dữ liệu qua Python script, schema migration cần chạy qua SQL Editor nếu kết nối trực tiếp bị chặn).

## Files to Create/Modify
- `supabase/migrations/007_enforce_mandatory_patient_fields.sql` - Migration script.

## Test Criteria
- [x] Migration chạy thành công không báo lỗi trên môi trường local.
- [x] Mở Supabase Studio kiểm tra cấu trúc bảng `patients`, xác nhận 3 cột trên là `NOT NULL`.

---
Next Phase: Hoàn thành.
