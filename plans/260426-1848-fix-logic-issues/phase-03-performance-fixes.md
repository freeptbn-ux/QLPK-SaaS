# Phase 03: Performance Optimization
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Tối ưu hóa hiệu năng, giảm thiểu các truy vấn database trùng lặp và ngăn chặn các re-render không cần thiết trên client.

## Requirements
### Functional
- [x] Route chi tiết bệnh nhân chỉ được fetch dữ liệu 1 lần thay vì 2 lần cho mỗi request.
- [x] Autocomplete của phần kê đơn thuốc không được phép reset debounce timer và gọi API dư thừa khi gõ.

### Non-Functional
- [ ] Performance: Giảm số lượng request tới database và tối ưu React rendering.

## Implementation Steps
1. [x] Sử dụng `React.cache()` cho hàm lấy dữ liệu bệnh nhân (`getPatientById`) được gọi trong cả `generateMetadata` và trang page của `src/app/(dashboard)/patients/[id]/page.tsx`.
2. [x] Refactor `MedicineAutocomplete.tsx` bằng cách dùng `useMemo` cho `excludeIds` và giữ ổn định hàm debounced fetch.

## Files to Create/Modify
- `src/app/(dashboard)/patients/[id]/page.tsx`
- `src/components/features/prescriptions/MedicineAutocomplete.tsx`

## Test Criteria
- [x] Mở trang chi tiết bệnh nhân, chỉ có 1 query DB được thực thi (check network/console).
- [x] Gõ chữ liên tục trong thanh tìm thuốc, API chỉ gọi 1 lần sau khi ngừng gõ 300ms.

---
Next Phase: Hoàn thành!
