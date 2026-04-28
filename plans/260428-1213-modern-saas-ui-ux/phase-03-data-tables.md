# Phase 03: Data Tables UX Boost
Status: ✅ Completed
Dependencies: phase-02-core-components.md

## Objective
Tối ưu hóa bảng dữ liệu trên trang Bệnh nhân (`/patients`) và Kho thuốc (`/medicines`) để tăng cường trải nghiệm người dùng, giúp dễ đọc hơn và phòng chống thao tác nhầm.

## Requirements
### Functional & Non-Functional
- [ ] Mở rộng khoảng cách các ô (`padding` của `td`, `th`).
- [ ] Text hiển thị: Nhấn mạnh tiêu đề cột, giảm độ nổi bật của dữ liệu phụ trợ. 
- [ ] Error Prevention: Gói gọn cột "Thao tác" có chứa nút Xóa vào Menu Dropdown (`...`) hoặc thiết kế lại rõ ràng hơn, có khoảng cách xa nút Sửa.
- [ ] Trạng thái trống (Empty State): Hiển thị minh họa đồ họa đẹp và hướng dẫn call-to-action khi không có dữ liệu (ví dụ: Kho thuốc trống).

## Implementation Steps
1. [ ] Xây dựng một Component `EmptyState` chuẩn mực cho dự án (nếu chưa có).
2. [ ] Khảo sát file cấu trúc Table (`PatientListClient.tsx` và `MedicineList.tsx` / `MedicineListClient.tsx`).
3. [ ] Cập nhật style CSS/Tailwind cho các bảng này (`border-b`, `py-4`, `px-6`...).
4. [ ] Cấu trúc lại giao diện 3 nút Action (Xem, Sửa, Xóa) cho an toàn và thẩm mỹ hơn. Bổ sung Alert Confirm trước khi Xóa nếu đang thiếu.

## Files to Create/Modify
- `src/components/features/patients/PatientListClient.tsx`
- `src/components/features/medicines/MedicineList.tsx` (hoặc file hiển thị bảng thuốc)
- Component EmptyState mới (ví dụ `src/components/ui/EmptyState.tsx`)

---
Next Phase: phase-04-dashboard-polish.md
