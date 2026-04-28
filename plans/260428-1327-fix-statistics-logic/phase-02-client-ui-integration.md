# Phase 02: Client UI Integration
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Đồng bộ logic truyền tham số giữa giao diện Client và Server, đồng thời tinh chỉnh một số vấn đề nhỏ về hiển thị UI.

## Requirements
### Functional
- [x] Truyền đúng tham số `selectedMonth` hoặc `timeRange` vào `getRevenueStats()` trong hàm `fetchData`.
- [x] Dọn dẹp state `loading` bị khai báo mà không sử dụng.
- [x] Hiển thị tiêu đề biểu đồ thân thiện hơn.

## Implementation Steps
1. [x] Mở file `src/components/features/statistics/StatisticsClient.tsx`.
2. [x] Cập nhật lời gọi `getRevenueStats()` trong `fetchData` để pass parameter phù hợp.
3. [x] Tìm `const [, setLoading] = useState(true);` -> xóa biến nếu không dùng hoặc gắn vào UI loading indicator.
4. [x] Mở file `src/components/features/statistics/VisitChart.tsx` (hoặc nơi truyền props title), sửa logic format title khi `timeRange === 'day'` thành dạng dễ đọc như "Tháng 5, 2024".

## Files to Create/Modify
- `src/components/features/statistics/StatisticsClient.tsx`
- `src/components/features/statistics/VisitChart.tsx`

## Test Criteria
- [ ] Biểu đồ lượt khám và doanh thu đồng nhất về mốc thời gian hiển thị.
- [ ] Tiêu đề biểu đồ đẹp mắt hơn.
- [ ] Không có cảnh báo state unused.

---
Next Phase: [Phase 03: Testing & Verification](./phase-03-testing-verification.md)
