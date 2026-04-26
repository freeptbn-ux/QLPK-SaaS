# Phase 02: Frontend State Fixes
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Đồng bộ trạng thái (state) trên giao diện Frontend với dữ liệu thực tế từ Server, tránh tình trạng UI hiển thị dữ liệu cũ (stale data).

## Requirements
### Functional
- [ ] Chi tiết bệnh nhân (`PatientDetail`) phải cập nhật ngay sau khi chỉnh sửa thành công (không bị dính cache ở `useState`).
- [ ] Ô tìm kiếm (`PatientSearch`) phải tự động cập nhật khi prop `initialValue` thay đổi (ví dụ khi back trang).
- [ ] Lịch sử khám bệnh (`PrescriptionHistory`) phải hiển thị đúng ID của đơn thuốc và chi tiết sau khi chỉnh sửa thay vì dùng `id: 0`.
- [ ] Dữ liệu thống kê lỗi (nếu có) phải được báo ra thay vì fallback về 0 trong im lặng.

## Implementation Steps
1. [ ] Gỡ bỏ việc lưu `patient` vào `useState` trong `PatientDetail.tsx`, dùng trực tiếp prop hoặc đồng bộ bằng `useEffect`.
2. [ ] Thêm `useEffect` để đồng bộ `initialValue` vào `searchTerm` trong `PatientSearch.tsx`.
3. [ ] Refactor logic cập nhật sau khi edit trong `PrescriptionHistory.tsx` (gọi refetch hoặc dùng kết quả trả về từ server thay vì tự tạo mock data).
4. [ ] Thêm xử lý lỗi/propagate error trong `src/actions/statistics.ts`.

## Files to Create/Modify
- `src/components/features/patients/PatientDetail.tsx`
- `src/components/features/patients/PatientSearch.tsx`
- `src/components/features/patients/PrescriptionHistory.tsx`
- `src/actions/statistics.ts`

## Test Criteria
- [ ] Edit thông tin bệnh nhân xong, UI tự động cập nhật tên/chuẩn đoán mới ngay lập tức.
- [ ] Bấm back từ trang detail về list có search query, ô input hiển thị đúng chữ đã gõ.
- [ ] Edit đơn thuốc không sinh ra lỗi duplicate key.

---
Next Phase: [Phase 03](phase-03-performance-fixes.md)
