# Phase 01: Database Rollup & Triggers
Status: ✅ Completed
Dependencies: None

## Objective
Tạo hạ tầng lưu trữ thống kê tối ưu và tự động hóa việc cập nhật dữ liệu.

## Implementation Steps
1. [x] **Tạo Migration:** Tạo bảng `clinic_daily_stats` với các cột:
    - `clinic_id` (BIGINT, FK)
    - `date` (DATE)
    - `visit_count` (INTEGER)
    - `total_revenue` (NUMERIC)
    - Primary Key: `(clinic_id, date)`
2. [x] **Setup Security:**
    - `ALTER TABLE clinic_daily_stats ENABLE ROW LEVEL SECURITY;`
    - Thêm policy SELECT/ALL cho authenticated users với `clinic_id = get_my_clinic_id()`.
3. [x] **Viết Function Trình kích hoạt (Trigger Function):**
    - Tạo `fn_sync_clinic_daily_stats()` để tự động tăng/giảm `visit_count` và `total_revenue` khi bảng `prescriptions_header` thay đổi.
4. [x] **Tạo Trigger:**
    - Gắn vào `prescriptions_header` cho các sự kiện AFTER INSERT, UPDATE, DELETE.
5. [x] **Backfill Data:**
    - Chạy một script SQL một lần để tổng hợp dữ liệu cũ từ `prescriptions_header` vào bảng rollup.

## Files to Create/Modify
- `supabase/migrations/20260511_setup_stats_rollup.sql` - [New Migration]

## Test Criteria
- [x] Bảng `clinic_daily_stats` được tạo thành công.
- [x] Khi tạo 1 đơn thuốc mới, dòng tương ứng trong `clinic_daily_stats` tự động tăng số lượng và doanh thu.
- [x] RLS hoạt động (không xem được dữ liệu clinic khác).
