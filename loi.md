# Lỗi phần Thống kê (Statistics)

Dưới đây là tổng hợp các vấn đề logic được phát hiện trong phần thống kê của dự án, phân loại theo mức độ: Nặng, Vừa, Nhẹ. Các tệp tham chiếu nằm trong repo để dễ kiểm tra.

## Nặng

- Không phát hiện lỗi logic nặng (không có lỗi làm mất dữ liệu hoặc lỗi bảo mật rõ ràng) trong phần mã thống kê hiện tại.

## Vừa

- **Không khớp khung thời gian giữa lượt khám và doanh thu**: Trong `src/components/features/statistics/StatisticsClient.tsx`, khi `timeRange` là `week`, `month` hoặc `year`, hàm `fetchData` gọi `getRevenueStats()` mà không truyền `selectedMonth` hoặc tham số thời gian tương ứng. Kết quả: biểu đồ/so sánh lượt khám và doanh thu có thể đại diện cho các khoảng thời gian khác nhau, gây hiểu nhầm cho người dùng.
  - File tham chiếu: [src/components/features/statistics/StatisticsClient.tsx](src/components/features/statistics/StatisticsClient.tsx)
  - Gợi ý sửa: truyền `selectedMonth` hoặc một tham số thời gian phù hợp cho `getRevenueStats` tùy theo `timeRange`, hoặc cập nhật RPC để nhận tham số kiểu khoảng thời gian (week/month/year).

- **So sánh ngày bắt đầu tháng bằng ISO string có thể gây lệch timezone**: Trong `src/actions/statistics.ts` hàm `getOverviewStats()` sử dụng `new Date(...).toISOString()` làm `startOfMonth` và so sánh với cột `prescription_date`. Nếu cột DB lưu dạng date (không có timezone) hoặc trong timezone khác, điều này có thể bỏ sót bản ghi nằm trong ngày đầu tháng (vấn đề vùng thời gian).
  - File tham chiếu: [src/actions/statistics.ts](src/actions/statistics.ts)
  - Gợi ý sửa: dùng so sánh theo ngày (YYYY-MM-DD) hoặc chuẩn hóa timezone ở cả hai phía; truyền `startOfMonth` dưới dạng `YYYY-MM-01` khi so sánh với cột date-only.

## Nhẹ

- **`loading` state bị khai báo nhưng không sử dụng**: Trong `StatisticsClient.tsx`, hook `const [, setLoading] = useState(true);` chỉ dùng `setLoading` mà không dùng biến trạng thái để hiển thị UI chờ. Có thể thêm hiển thị loading hoặc xoá biến nếu không dùng.
  - File tham chiếu: [src/components/features/statistics/StatisticsClient.tsx](src/components/features/statistics/StatisticsClient.tsx)

- **`getPatientDobsByTime` trả về `dob` có thể là `null`**: Hàm RPC trả mảng có thể chứa `dob: null`; client đang lọc null bằng `dobs.filter(...)` nên không hiển thị, nhưng tốt hơn là xử lý lọc ở server hoặc đảm bảo kiểu trả về rõ ràng.
  - File tham chiếu: [src/actions/statistics.ts](src/actions/statistics.ts)
  - Gợi ý sửa: RPC trả về chỉ DOB hợp lệ hoặc server-side lọc `WHERE dob IS NOT NULL`.

- **Tiêu đề biểu đồ hiển thị ngày thô**: VisitChart title khi `timeRange === 'day'` hiển thị `tháng ${selectedMonth}` với định dạng `YYYY-MM`. Có thể format đẹp hơn (Ví dụ: `05/2024` hoặc `Tháng 5, 2024`).
  - File tham chiếu: [src/components/features/statistics/StatisticsClient.tsx](src/components/features/statistics/StatisticsClient.tsx)

- **Giả định trường `month` trong RPC `get_distinct_months_years`**: `getDistinctMonthsYears()` map `(item) => item.month` — nếu RPC đổi tên trường (ví dụ `year_month`) sẽ gây lỗi; mặc dù tests hiện tại giả định `month`, nên chú ý khi thay đổi RPC.
  - File tham chiếu: [src/actions/statistics.ts](src/actions/statistics.ts)

---

Nếu bạn muốn, tôi có thể:
- Gợi ý patch code (ví dụ: truyền `selectedMonth` vào `getRevenueStats` cho từng `timeRange`).
- Kiểm tra/viết SQL RPC (nếu bạn đưa file migrations/SQL) để đảm bảo các RPC trả dữ liệu đúng dạng và lọc null.

File liên quan chính đã kiểm tra:
- [src/actions/statistics.ts](src/actions/statistics.ts)
- [src/components/features/statistics/StatisticsClient.tsx](src/components/features/statistics/StatisticsClient.tsx)
- Các component biểu đồ: [src/components/features/statistics/VisitChart.tsx](src/components/features/statistics/VisitChart.tsx) và [src/components/features/statistics/RevenueChart.tsx](src/components/features/statistics/RevenueChart.tsx)
