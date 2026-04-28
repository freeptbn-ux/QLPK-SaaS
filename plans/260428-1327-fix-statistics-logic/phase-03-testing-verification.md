# Phase 03: Testing & Verification
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Kiểm tra lại toàn bộ trang thống kê để đảm bảo các lỗi đã được sửa đúng mà không gây ra hồi quy (regression) cho các tính năng hiện có.

## Requirements
### Functional
- [ ] Build dự án thành công.
- [ ] Truy cập `http://localhost:3000/statistics` (hoặc URL tương ứng) và kiểm tra các tab.
- [ ] Dữ liệu hiển thị của biểu đồ doanh thu và biểu đồ lượt khám phải khớp nhau trên các mốc thời gian (Tuần/Tháng/Năm).
- [ ] Chọn một tháng mới để kiểm tra lỗi timezone có bỏ sót bản ghi ngày 01 đầu tháng hay không.
- [ ] Tiêu đề hiển thị đẹp mắt, không còn lỗi UI.

## Implementation Steps
1. [ ] Chạy lệnh `npm run lint` hoặc `npm run build` để kiểm tra compile errors.
2. [ ] Khởi động server với `npm run dev` nếu chưa chạy.
3. [ ] Click qua lại giữa các view thời gian để xem biểu đồ và API response.

## Files to Create/Modify
- Không (Chỉ kiểm tra).

## Test Criteria
- [ ] Mọi biểu đồ render chính xác.
- [ ] Không có báo lỗi ở console (cả Server và Browser).

---
Next Phase: Hoàn thành!
