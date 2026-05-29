# Phase 02: Backend Security Hardening
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Sửa đổi Server Actions để sử dụng hạ tầng mới và vá các lỗ hổng bảo mật/logic.

## Implementation Steps
1. [x] **Refactor `getOverviewStats`:**
    - Chuyển từ đếm head head head sang query bảng `clinic_daily_stats`.
    - **BẮT BUỘC:** Thêm `.eq('clinic_id', clinicId)`.
2. [x] **Refactor `getRevenueStats`:**
    - Triển khai logic aggregation (SUM) cho `week` và `month` để tránh trả về quá nhiều điểm dữ liệu.
3. [x] **Timezone Hardening:**
    - Cập nhật `src/actions/statistics.ts` để sử dụng `dayjs.tz('Asia/Ho_Chi_Minh')`.
    - Đảm bảo `startOfMonth` được tính toán chính xác theo múi giờ VN.
4. [x] **Fix Legacy RPCs:**
    - Sửa lỗi ISO Week (`IYYY-IW`) trong `20260510_fix_stats_rls.sql`.
    - Chuyển `INNER JOIN` thành `LEFT JOIN` trong `get_medicine_usage_stats`.

## Files to Create/Modify
- `src/actions/statistics.ts` - Fix logic filtering & aggregation.
- `supabase/migrations/20260511_fix_legacy_stats_issues.sql` - Fix ISO week & Join bugs.

## Test Criteria
- [x] Dashboard hiển thị đúng số liệu của đúng clinic.
- [x] Biểu đồ tháng chỉ hiển thị 12 cột (thay vì 365 điểm).
- [x] Xóa một loại thuốc không làm mất doanh thu lịch sử trong thống kê.
