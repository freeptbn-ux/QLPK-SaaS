# Phase 03: Statistics Data Hydration
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Khử bỏ Waterfall trên Client tại trang Thống kê bằng cách truyền dữ liệu biểu đồ ban đầu từ Server thay vì fetch sau khi mount.

## Requirements
### Functional
- [x] Fetch `initialChartData` tại Server Component của trang Thống kê.
- [x] Cập nhật `StatisticsClient.tsx` để nhận và sử dụng dữ liệu ban đầu này.
- [x] Tránh fetch lại dữ liệu trong lần render đầu tiên nếu filter không đổi.

## Implementation Steps
1. [x] Chỉnh sửa `src/app/(dashboard)/statistics/page.tsx` (hoặc file tương đương gọi StatisticsClient):
   - Fetch dữ liệu biểu đồ (visits, revenue, etc.) cho tháng hiện tại.
2. [x] Chỉnh sửa `src/components/features/statistics/StatisticsClient.tsx`:
   - Thêm prop `initialChartData`.
   - Sử dụng `useRef` để theo dõi lần render đầu tiên (`isFirstRender`).
   - Bỏ qua lần fetch đầu trong `useEffect`.

## Files to Create/Modify
- `src/components/features/statistics/StatisticsClient.tsx`
- `src/app/(dashboard)/statistics/page.tsx` (Cần xác định chính xác path trang thống kê)

## Test Criteria
- [x] Trang thống kê không còn hiển thị Spinner/Loading ngay khi vừa load (trừ khi chuyển filter).
- [x] Biểu đồ có dữ liệu ngay lập tức khi trang vừa render xong trên Client.

---
Next Phase: [Phase 04: Config & Bundle](phase-04-config-bundle-optimization.md)
