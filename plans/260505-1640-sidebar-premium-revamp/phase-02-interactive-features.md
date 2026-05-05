# Phase 02: Collapsible Mode & Tooltips
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Thêm tính năng thu nhỏ (Collapse) Sidebar để tối ưu không gian làm việc và tích hợp Tooltips cho chế độ mini.

## Requirements
### Functional
- [ ] Cho phép User toggle giữa Full và Mini sidebar.
- [ ] Lưu trạng thái collapse vào `localStorage`.
- [ ] Hiển thị Tooltip khi hover vào icon ở chế độ Mini.
- [ ] Hiệu ứng co giãn mượt mà (Smooth width transition).

### Non-Functional
- [ ] Sử dụng `framer-motion` cho các hiệu ứng chuyển cảnh.
- [ ] Đảm bảo layout chính (`DashboardShell`) tự động điều chỉnh margin-left theo độ rộng sidebar.

## Implementation Steps
1. [ ] **State Management**: Thêm `isCollapsed` state và logic persistence.
2. [ ] **Framer Motion Integration**: Bọc Sidebar bằng `motion.aside` để animate width.
3. [ ] **Tooltip Component**: Tích hợp một thư viện tooltip nhẹ hoặc tự custom bằng CSS/Radix UI.
4. [ ] **Shell Sync**: Cập nhật `DashboardShell` để phản hồi lại sự thay đổi kích thước của Sidebar.

## Files to Create/Modify
- `src/components/features/Sidebar.tsx` - Implement collapse logic.
- `src/components/features/DashboardShell.tsx` - Sync main content margin.
- `src/components/ui/Tooltip.tsx` (New) - For mini sidebar labels.

## Test Criteria
- [ ] Sidebar thu nhỏ/mở rộng mượt mà, không bị giật lag.
- [ ] Khi thu nhỏ, text bị ẩn đi và Tooltip hiện ra khi hover.
- [ ] Trạng thái được giữ nguyên sau khi reload trang.

---
Next Phase: [Phase 03: Polish & Testing](./phase-03-polish-and-cleanup.md)
