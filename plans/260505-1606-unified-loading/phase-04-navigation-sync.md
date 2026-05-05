# Phase 04: Navigation Sync

## Objective
Cập nhật `NavigationEvents` để nó không tự render UI nữa mà chỉ làm nhiệm vụ thông báo trạng thái điều hướng cho `LoadingProvider`.

## Implementation Steps
1. [x] Sửa `src/components/Loading/NavigationEvents.tsx`.
2. [x] Loại bỏ việc render `<BallLoader />` bên trong component.
3. [x] Thay bằng việc gọi `setIsNavigating(true)` khi bắt đầu click và `setIsNavigating(false)` khi `pathname` hoặc `searchParams` thay đổi.
4. [x] Đảm bảo logic phát hiện click vẫn hoạt động chính xác.

## Files to Create/Modify
- `src/components/Loading/NavigationEvents.tsx` (Modify)

## Test Criteria
- [ ] Click vào menu bên trái: Loader hiện ngay lập tức (do NavigationEvents kích hoạt).
- [ ] Khi trang mới load xong: Loader biến mất mượt mà.
