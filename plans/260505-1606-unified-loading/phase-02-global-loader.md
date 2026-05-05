# Phase 02: Global Loader Component

## Objective
Tạo một component hiển thị loader duy nhất, lắng nghe trạng thái từ provider và hỗ trợ hiển thị text động.

## Implementation Steps
1. [x] Tạo `src/components/Loading/GlobalLoader.tsx`.
2. [x] Component này sẽ sử dụng `BallLoader`.
3. [x] Prop `isOverlay={true}` sẽ được dùng mặc định để phủ toàn bộ màn hình (đảm bảo tính duy nhất).
4. [x] Nhận `loadingText` từ `useLoading()` để hiển thị phía dưới animation.
5. [x] Sử dụng `framer-motion` (AnimatePresence) để fade-in/out mượt mà, tránh hiện tượng nhấp nháy khi đổi trạng thái.
6. [x] Đưa `GlobalLoader` vào `RootLayout`.

## Files to Create/Modify
- `src/components/Loading/GlobalLoader.tsx` (New)
- `src/app/layout.tsx` (Modify)

## Test Criteria
- [x] Loader hiện ra với đúng text truyền vào.
- [x] Khi chuyển đổi giữa các trạng thái (Navigating -> Streaming), loader không bị unmount/remount gây nhảy animation.

