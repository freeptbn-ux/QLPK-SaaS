# Phase 02: Suspense & Streaming
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Sử dụng React Suspense để streaming dữ liệu, giúp hiển thị khung trang (PageHeader, Layout) ngay lập tức trong khi chờ dữ liệu danh sách bệnh nhân.

## Requirements
### Functional
- [x] Tách phần fetch dữ liệu trong `PatientsPage` ra một Wrapper component.
- [x] Sử dụng `<Suspense>` bọc ngoài danh sách.

## Implementation Steps
1. [x] Chỉnh sửa `src/app/(dashboard)/patients/page.tsx`:
   - Tạo component `PatientListWrapper`.
   - Di chuyển logic `await searchPatients` hoặc `getPatientsPaginated` vào Wrapper.
   - Sử dụng `Suspense` với `fallback` là `BallLoader`.

## Files to Create/Modify
- `src/app/(dashboard)/patients/page.tsx` - Áp dụng Suspense.

## Test Criteria
- [x] Khi load trang, Page Header "Bệnh nhân" hiện ra ngay lập tức.
- [x] Spinner/Loader hiển thị ở khu vực danh sách trước khi dữ liệu xuất hiện.

---
Next Phase: [Phase 03: Statistics Data Hydration](phase-03-statistics-hydration.md)
