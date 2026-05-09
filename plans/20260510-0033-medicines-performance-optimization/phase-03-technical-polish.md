# Phase 03: Technical Polish & Refinement
Status: ✅ Completed
Dependencies: Phase 01, Phase 02

## Objective
Hoàn thiện các chi tiết kỹ thuật nhỏ để tối ưu hóa triệt để tài nguyên và cải thiện cảm giác tốc độ cho người dùng.

## Requirements
### Functional
- [x] Chỉ fetch các cột cần thiết từ Database.
- [x] Cải thiện UI Loading (Skeleton loaders).
- [x] Kiểm tra và sửa các lỗi UI/UX còn tồn tại sau tối ưu.

### Non-Functional
- [x] LCP (Largest Contentful Paint) < 2.5s.
- [x] CLS (Cumulative Layout Shift) < 0.1.

## Implementation Steps
1. [x] **Column Selection Optimization**:
    - Sửa câu lệnh `select('*')` thành `select('id, name, packing_spec, price, stock_quantity, min_stock_level')` trong `src/actions/medicines.ts`.
2. [x] **Skeleton Loaders**:
    - Tạo `MedicineTableSkeleton` component.
    - Cập nhật `src/app/(dashboard)/medicines/loading.tsx` để hiển thị skeleton khớp với cấu trúc bảng thực tế.
3. [x] **Final Audit**:
    - Chạy `/audit` để kiểm tra bảo mật và hiệu suất tổng thể.
    - Chạy `/test` để đảm bảo không có regressions.

## Files to Create/Modify
- `src/actions/medicines.ts` - Refine select columns.
- `src/components/medicines/MedicineTableSkeleton.tsx` - Component mới.
- `src/app/(dashboard)/medicines/loading.tsx` - Cập nhật UI loading.

## Test Criteria
- [ ] Kiểm tra payload JSON: Phải cực kỳ gọn nhẹ.
- [ ] Trải nghiệm loading: Không có hiện tượng giật cục (Layout shift) khi chuyển từ loading sang data.

---
Plan Complete!
