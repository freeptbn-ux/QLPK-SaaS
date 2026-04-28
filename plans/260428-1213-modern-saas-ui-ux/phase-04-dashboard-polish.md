# Phase 04: Dashboard & Specific Pages Polish
Status: ✅ Completed
Dependencies: phase-03-data-tables.md

## Objective
Tút tát lại màn hình Thống kê (Dashboard) và Cài đặt cho đồng bộ hoàn toàn với Vibe mới. Đảm bảo các Metric Cards (Thẻ chỉ số) nổi bật, sinh động và biểu đồ được styling đúng tone màu.

## Requirements
### Functional & Non-Functional
- [x] Màn Thống kê: Các thẻ Metric (Tổng bệnh nhân, Doanh thu, Lượt khám, Thuốc sắp hết) cần có Icon kích thước lớn, màu nền Icon nhạt (tương ứng với loại dữ liệu), số liệu to và rõ ràng.
- [x] Biểu đồ (Charts): Đồng bộ màu sắc biểu đồ với Theme chính (màu Blue cho thanh Bar, bỏ grid lines lộn xộn nếu có, font chữ nhỏ sắc nét).
- [x] Màn Cài đặt: Tái cấu trúc thành các Card riêng biệt cho từng phần (Thông tin phòng khám, Tài chính, Bảo mật, Giao diện). Tạo cảm giác gọn gàng và dễ config hơn.

## Implementation Steps
1. [x] Cập nhật file `page.tsx` của `/statistics`: Sửa lại Grid layout và style các thẻ Metric Cards (bo góc, bóng mờ, màu icon).
2. [x] Style lại các components Biểu đồ (`Charts.tsx` hoặc tương đương) bên trong trang thống kê.
3. [x] Cập nhật file `page.tsx` của `/settings`: Bọc các thẻ Form bằng component Card, tối ưu nút "Lưu thay đổi".

## Files to Create/Modify
- `src/app/statistics/page.tsx` (Và các thẻ con)
- `src/app/settings/page.tsx` (Và các thẻ con)

---
Next Phase: N/A
