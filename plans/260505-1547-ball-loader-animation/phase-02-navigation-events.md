# Phase 02: Tích hợp Global Navigation Loader

## Objective
Tự động hiển thị BallLoader mỗi khi người dùng click vào một link điều hướng trong ứng dụng.

## Requirements
### Functional
- [x] Bắt sự kiện `click` toàn cục trên `document`.
- [x] Kiểm tra xem phần tử được click có phải là link nội bộ (internal link) không.
- [x] Kích hoạt trạng thái `isNavigating = true` khi bắt đầu điều hướng.
- [x] Sử dụng `usePathname` và `useSearchParams` để phát hiện khi route thay đổi và ẩn loader (`isNavigating = false`).
- [x] Hiển thị BallLoader dưới dạng overlay toàn màn hình với độ mờ nhẹ (backdrop-blur).
- [x] Tương thích hoàn toàn với Mobile (xử lý cả sự kiện touch, đảm bảo overlay phủ kín toàn bộ viewport di động).

### Non-Functional
- [x] Không chặn các thao tác click khác (nút bấm, checkbox, v.v.).
- [x] Xử lý các trường hợp click đặc biệt (Ctrl+Click để mở tab mới) để không hiện loader sai chỗ.

## Implementation Steps
1. [x] Tạo file `src/components/Loading/NavigationEvents.tsx` chứa logic bắt sự kiện.
2. [x] Tích hợp `NavigationEvents` vào `src/app/layout.tsx` (bọc trong Suspense).
3. [x] Thêm `BallLoader` vào `ThemeRegistry` hoặc `layout.tsx` để hiển thị overlay khi cần.

## Files to Create/Modify
- `src/components/Loading/NavigationEvents.tsx` - Logic điều khiển.
- `src/app/layout.tsx` - Đăng ký component toàn cục.
- `src/components/ThemeRegistry.tsx` - Tích hợp UI loader.

## Test Criteria
- [x] Click vào bất kỳ link nào trong menu đều hiện loading overlay.
- [x] Loader biến mất sau khi trang mới đã render xong.
- [x] Không hiện loader khi nhấn Ctrl+Click hoặc click vào link ngoài trang.
