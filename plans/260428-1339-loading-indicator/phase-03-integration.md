# Phase 03: Client Integration
Status: ✅ Complete
Dependencies: Phase 02

## Objective
Áp dụng `Loading` component vào các module chính trên frontend để thay thế cho loading raw/text cũ.

## Requirements
### Functional
- [ ] Thay thế loading text ở 3 màn hình chính (Ví dụ: Dashboard, Danh sách bệnh nhân, Cài đặt).
- [ ] Lựa chọn variant phù hợp cho từng vị trí (Skeleton cho thẻ/danh sách, Spinner cho button/modal).

### Non-Functional
- [ ] Đảm bảo UI không bị layout shift (giữ nguyên kích thước container khi thay bằng Skeleton).

## Implementation Steps
1. [ ] Tìm các file dùng text "Loading..." hoặc `isLoading` conditional rendering.
2. [ ] Thay thế bằng `<Loading variant="skeleton" />` ở Danh sách bệnh nhân (`PatientListClient.tsx` hoặc tương tự).
3. [ ] Thay thế bằng `<Loading variant="spinner" />` ở các button thao tác.
4. [ ] Cập nhật Statistics Dashboard (ví dụ `StatisticsClient.tsx`) dùng Skeleton / Shimmer.

## Files to Create/Modify
- `src/components/features/patients/PatientListClient.tsx` (hoặc tương tự)
- `src/components/features/statistics/StatisticsClient.tsx` (hoặc tương tự)
- Các file page/components chứa logic fetch dữ liệu.

## Test Criteria
- [ ] Trải nghiệm tải trang thật ở 3 màn hình đều mượt mà.
- [ ] Layout không giật (shift) khi loading hiển thị và biến mất.

## Notes
- Cân nhắc kích thước (size props) để Skeleton ôm vừa khít không gian thay thế.

---
Next Phase: [Phase 04: Testing & Docs](./phase-04-testing-docs.md)
