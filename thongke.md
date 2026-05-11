# Báo cáo Phân tích Logic Thống kê (Statistics Logic Audit)
**Ngày báo cáo:** 2026-05-11
**Người thực hiện:** Antigravity Detective

## 1. Các Lỗi Logic Nghiêm trọng (Critical Issues)

### 1.1. Rò rỉ dữ liệu giữa các phòng khám (Multi-tenancy Leak)
- **Vị trí:** `src/actions/statistics.ts` -> hàm `getOverviewStats` (Dòng 196).
- **Mô tả:** Truy vấn vào bảng `clinic_daily_stats` thiếu filter `.eq('clinic_id', clinicId)`.
- **Hệ quả:** Trong mô hình SaaS, Dashboard sẽ hiển thị tổng doanh thu và lượt khám của **tất cả phòng khám trong hệ thống**, không chỉ của phòng khám hiện tại. Đây là lỗi bảo mật và logic cực kỳ nghiêm trọng.
- **Cách sửa:** Thêm filter `clinic_id` vào query.

### 1.2. Sai lệch dữ liệu biểu đồ theo thời gian (Aggregation Logic)
- **Vị trí:** `src/actions/statistics.ts` -> hàm `getRevenueStats` (Dòng 181).
- **Mô tả:** Khi chọn xem theo 'Tuần' hoặc 'Tháng', hàm này vẫn trả về dữ liệu chi tiết từng ngày (Daily) thay vì gom nhóm (Group by Week/Month).
- **Hệ quả:** Biểu đồ sẽ hiển thị sai lệch hoặc quá dày đặc (ví dụ: xem 12 tháng nhưng lại hiện 365 điểm dữ liệu ngày).
- **Cách sửa:** Triển khai logic aggregation (sum) theo tuần/tháng trong Server Action hoặc dùng RPC chuyên biệt.

## 2. Các Lỗi về Độ chính xác & Toàn vẹn (Accuracy & Integrity)

### 2.1. Sai lệch múi giờ đầu tháng (Timezone Sensitivity)
- **Vị trí:** `src/actions/statistics.ts` -> hàm `getOverviewStats` (Dòng 190-192).
- **Mô tả:** Sử dụng `new Date()` của runtime (thường là UTC) để tính `startOfMonth`. 
- **Hệ quả:** Tại Việt Nam (UTC+7), từ 00:00 đến 07:00 ngày đầu tháng, Dashboard sẽ vẫn hiển thị số liệu của tháng trước hoặc bằng 0 tùy vào cách filter.
- **Cách sửa:** Sử dụng `dayjs.tz` với múi giờ 'Asia/Ho_Chi_Minh' hoặc lấy thời gian hiện tại từ PostgreSQL (`SELECT NOW()`).

### 2.2. Mất dữ liệu thống kê khi xóa thuốc (Data Integrity)
- **Vị trí:** `supabase/migrations/20260510_fix_stats_rls.sql` -> RPC `get_medicine_usage_stats`.
- **Mô tả:** Sử dụng `INNER JOIN medicines m`. 
- **Hệ quả:** Nếu một loại thuốc bị xóa khỏi danh mục (Table `medicines`), toàn bộ doanh thu và số lượng đã kê đơn của thuốc đó trong quá khứ sẽ biến mất khỏi báo cáo thống kê.
- **Cách sửa:** Chuyển sang sử dụng `LEFT JOIN` hoặc triển khai cơ chế Soft Delete cho thuốc.

### 2.3. Lỗi tính toán tuần cuối năm (ISO Week Bug)
- **Vị trí:** RPC `get_stats_by_week`.
- **Mô tả:** Sử dụng `EXTRACT(WEEK FROM ...)` kết hợp với `EXTRACT(YEAR FROM ...)`.
- **Hệ quả:** Tuần đầu tiên của năm mới (ISO Week 1) thường rơi vào những ngày cuối tháng 12 năm cũ. Việc kết hợp này sẽ tạo ra nhãn sai (ví dụ: W1/2023 thay vì W1/2024).
- **Cách sửa:** Sử dụng `to_char(date, 'IYYY-"W"IW')` để đảm bảo tính toán theo chuẩn ISO Week.

## 3. Đánh giá Thiết kế (Design Review)

- **Inconsistent Implementation:** Có sự pha trộn giữa việc gọi RPC (Logic nằm ở Database) và gọi trực tiếp Table (Logic nằm ở App). Điều này gây khó kiểm soát RLS và khó bảo trì.
- **Missing Rollup Logic:** Bảng `clinic_daily_stats` có vẻ được tạo ra để tối ưu nhưng logic cập nhật (Trigger/Function) chưa được tìm thấy trong các file migration hiện tại, dẫn đến nguy cơ dữ liệu trong bảng này bị "out of sync" so với bảng `prescriptions_header`.

---
**Khuyến nghị:** Cần thực hiện Phase 03 để fix triệt để các lỗi trên trước khi bàn giao production.
