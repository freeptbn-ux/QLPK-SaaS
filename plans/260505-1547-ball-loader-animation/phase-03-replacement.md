# Phase 03: Thay thế hệ thống Skeleton & Loading mặc định

## Objective
Loại bỏ hoàn toàn các skeleton loader hiện có và thay thế các file `loading.tsx` bằng `BallLoader` mới để đảm bảo tính nhất quán.

## Requirements
### Functional
- [x] Cập nhật `src/app/loading.tsx` để sử dụng `BallLoader`.
- [x] Cập nhật `src/app/(dashboard)/loading.tsx` để sử dụng `BallLoader`.
- [x] Thay thế code hiển thị Skeleton trong `src/app/(dashboard)/patients/loading.tsx` bằng `BallLoader`.
- [x] Rà soát tất cả các file `loading.tsx` khác trong dự án.

## Implementation Steps
1. [x] Sửa `src/app/loading.tsx`.
2. [x] Sửa `src/app/(dashboard)/loading.tsx`.
3. [x] Sửa `src/app/(dashboard)/patients/loading.tsx`.
4. [x] Xóa hoặc đánh dấu "Deprecated" cho `src/components/ui/LoadingSkeleton.tsx` nếu không còn nơi nào sử dụng.

## Files to Create/Modify
- `src/app/loading.tsx`
- `src/app/(dashboard)/loading.tsx`
- `src/app/(dashboard)/patients/loading.tsx`
- `src/app/(dashboard)/medicines/loading.tsx`
- `src/app/(dashboard)/patients/[id]/prescribe/loading.tsx`

## Test Criteria
- [x] Khi chờ dữ liệu từ server, màn hình hiển thị 4 quả bóng xoay thay vì các ô xám nhấp nháy (skeleton).
- [x] Không còn bất kỳ Skeleton nào xuất hiện trong quá trình chuyển trang.
