# Plan: Unified Loading System 🌀

Dự án hiện tại đang gặp vấn đề "Redundant Loading": khi chuyển trang, cả `NavigationEvents` (overlay) và `loading.tsx` (inline) đều xuất hiện, gây hiện tượng nhảy hoặc chồng chéo loader.

Kế hoạch này sẽ thống nhất tất cả về một "Single Source of Truth".

## 🎯 Mục tiêu
- Chỉ có duy nhất 1 `BallLoader` hiển thị tại bất kỳ thời điểm nào.
- Chuyển cảnh mượt mà, không bị "nhảy" vị trí hoặc kích thước.
- Tự động kích hoạt khi click link (Navigation) và khi streaming dữ liệu (loading.tsx).

## 🛠️ Giải pháp kỹ thuật: "Global Handover"
Chúng ta sẽ sử dụng một **LoadingProvider** để quản lý trạng thái loading toàn cục:
1. `NavigationEvents` báo cáo khi bắt đầu điều hướng.
2. `loading.tsx` báo cáo khi segment đang được fetch.
3. Một `GlobalLoader` duy nhất nằm ở `RootLayout` sẽ lắng nghe và hiển thị loader.
4. Các file `loading.tsx` sẽ trở nên "im lặng" (không render UI) để tránh xung đột.

## 📋 Danh sách các Phases

| Phase | Tên | Trạng thái | Nhiệm vụ chính |
|-------|-----|------------|----------------|
| 01 | [Centralized Loading State](./phase-01-loading-provider.md) | ⬜ Pending | Tạo Context/Provider để quản lý trạng thái loading toàn cục. |
| 02 | [Global Loader Component](./phase-02-global-loader.md) | ⬜ Pending | Tạo component GlobalLoader hiển thị duy nhất tại Root Layout. |
| 03 | [Silent Loading Segments](./phase-03-silent-loading.md) | ⬜ Pending | Cập nhật các file `loading.tsx` để tích hợp với hệ thống mới. |
| 04 | [Navigation Sync](./phase-04-navigation-sync.md) | ⬜ Pending | Đồng bộ `NavigationEvents` với Global State. |
| 05 | [Cleanup & Polish](./phase-05-cleanup.md) | ⬜ Pending | Xóa bỏ các component cũ, tinh chỉnh animation mượt mà. |

---
## ➡️ Bước tiếp theo:
Tôi sẽ bắt đầu tạo chi tiết các file phase. Anh thấy hướng đi "Single Source of Truth" này ổn chưa?
