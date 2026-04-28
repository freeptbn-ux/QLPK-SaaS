# Phase 01: Core Action Fixes
Status: ✅ Completed
Dependencies: None

## Objective
Sửa lỗi logic trong các Server Actions tại `src/actions/statistics.ts`.

## Requirements
### Functional
- [x] Cập nhật `getOverviewStats()`: Xử lý so sánh ngày bắt đầu tháng (`startOfMonth`) theo định dạng `YYYY-MM-DD` để tránh lệch múi giờ (hiện tại đang dùng `toISOString()`).
- [x] Cập nhật `getPatientDobsByTime()`: Lọc bỏ các bản ghi có `dob` là `null` hoặc không hợp lệ (nếu RPC trả về null).
- [x] Kiểm tra và note lại giả định trường `month` trong RPC `get_distinct_months_years` để tránh lỗi sau này nếu thay đổi DB.

## Implementation Steps
1. [x] Mở file `src/actions/statistics.ts`.
2. [x] Trong `getOverviewStats()`, chuyển đổi `startOfMonth` sang định dạng Local Date String `YYYY-MM-DD` khi query.
3. [x] Trong `getPatientDobsByTime()`, thêm xử lý loại bỏ null/undefined trước khi trả về mảng.
4. [x] Cập nhật signature hàm `getRevenueStats()` để sẵn sàng nhận thêm tham số lọc theo thời gian (`timeRange`, `selectedMonth`) phục vụ cho Client.

## Files to Create/Modify
- `src/actions/statistics.ts`

## Test Criteria
- [x] Không có lỗi type/lint trong `src/actions/statistics.ts`.

---
Next Phase: [Phase 02: Client UI Integration](./phase-02-client-ui-integration.md)
