# Phase 01: Refactor Statistics & Types
Status: ✅ Completed
Dependencies: None

## Objective
Tối ưu hóa hàm `getOverviewStats` bằng cách sử dụng bảng `clinic_daily_stats` cho cả Doanh thu và Lượt khám, đồng thời đảm bảo Type Safety.

## Requirements
### Functional
- [x] Tính tổng doanh thu tháng dùng `.select('total_revenue.sum()')` (Fallback to code aggregate due to DB restriction).
- [x] Tính tổng lượt khám tháng dùng `.select('visit_count.sum()')` (Fallback to code aggregate due to DB restriction).
- [x] Lấy số lượng bệnh nhân (vẫn dùng bảng `patients`).
- [x] Lấy số lượng thuốc sắp hết hàng (vẫn dùng RPC `get_low_stock_count`).

### Technical
- [x] Bổ sung interface `ClinicDailyStats` vào `src/types/database.ts`.
- [x] Đảm bảo xử lý đúng kiểu dữ liệu trả về từ PostgREST aggregation (Handled via fetch & reduce for robustness).

## Implementation Steps
1. [x] Cập nhật `src/types/database.ts`: Thêm interface `ClinicDailyStats`.
2. [x] Mở file `src/actions/statistics.ts`.
3. [x] Refactor `getOverviewStats`:
    - Thay thế truy vấn `prescriptions_header` (lượt khám) bằng bảng `clinic_daily_stats`.
    - Thay thế RPC `get_monthly_revenue_total` bằng bảng `clinic_daily_stats`.
4. [x] Cập nhật logic return để mapping đúng các chỉ số mới.

## Files to Create/Modify
- `src/types/database.ts` - Thêm định nghĩa bảng thống kê.
- `src/actions/statistics.ts` - Cập nhật logic Dashboard.

## Test Criteria
- [x] Dashboard không còn lỗi crash.
- [x] Code TypeScript không báo lỗi khi build.
- [x] Thời gian phản hồi của `getOverviewStats` < 200ms.

---
Next Phase: [Phase 02: Data Verification](./phase-02-verification.md)
