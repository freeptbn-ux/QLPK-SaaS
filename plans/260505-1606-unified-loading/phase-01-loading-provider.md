# Phase 01: Centralized Loading State

## Objective
Thiết lập một "Single Source of Truth" cho trạng thái loading của toàn bộ ứng dụng bằng React Context, hỗ trợ quản lý text hiển thị động.

## Implementation Steps
1. [x] Tạo file `src/components/Loading/LoadingProvider.tsx`.
2. [x] Định nghĩa `LoadingContext` với các trạng thái:
    - `isNavigating`: Trạng thái khi click link (boolean).
    - `isStreaming`: Trạng thái khi Next.js đang render segment (boolean).
    - `loadingText`: Text hiển thị bên dưới loader (string).
    - `globalLoading`: Getter computed (true nếu 1 trong 2 cái trên true).
3. [x] Export các hooks `useLoading` để các component khác có thể cập nhật trạng thái:
    - `startLoading(text?: string)`: Bật loader với text tùy chọn.
    - `stopLoading()`: Tắt loader.
4. [x] Bao bọc `RootLayout` bằng `LoadingProvider`.

## Files to Create/Modify
- `src/components/Loading/LoadingProvider.tsx` (New)
- `src/app/layout.tsx` (Modify)

## Test Criteria
- [x] Provider khởi tạo thành công không gây lỗi hydration.
- [x] Có thể gọi `useLoading().startLoading("Đang xử lý...")` từ console hoặc component để hiện loader.
