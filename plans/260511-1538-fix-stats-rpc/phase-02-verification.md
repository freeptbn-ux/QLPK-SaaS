# Phase 02: Data Verification & Backfill
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Xác minh tính chính xác của dữ liệu và đảm bảo bảng thống kê đã có đủ dữ liệu quá khứ.

## Requirements
### Functional
- [x] So sánh số liệu Dashboard với truy vấn SQL đếm thực tế.
- [x] Kiểm tra lỗi "Batch Error" đã hoàn toàn biến mất.
- [x] Đảm bảo nếu tháng mới bắt đầu, số liệu khởi tạo là 0 (không phải Null/Error).

## Implementation Steps
1. [x] Mở trình duyệt, kiểm tra Dashboard.
2. [x] Sử dụng SQL Editor để kiểm tra xem bảng `clinic_daily_stats` đã được backfill chưa.
3. [x] Nếu chưa có dữ liệu, cần thực hiện một lệnh `INSERT ... SELECT` từ dữ liệu cũ sang bảng rollup (Backfill).
4. [x] Kiểm tra tính toàn vẹn dữ liệu cho ít nhất 3 ngày gần nhất.

## Test Criteria
- [x] Doanh thu tháng hiển thị đúng số tiền (ví dụ: 12,500,000đ).
- [x] Lượt khám hiển thị đúng số lượng (ví dụ: 45 lượt).

## Notes
Việc dùng `.sum()` của PostgREST có thể trả về kiểu dữ liệu là `string` trong kết quả JSON, cần ép kiểu sang `Number` trong Server Action.
