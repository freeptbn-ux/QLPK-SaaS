# Phase 02: Bottom Sheet Component
Status: ⬜ Pending
Dependencies: phase-01-setup.md

## Objective
Xây dựng một component dùng chung `BottomSheet` hoặc nâng cấp component Dialog hiện tại để hỗ trợ chế độ "Sheet".

## Requirements
### Functional
- Component sử dụng `framer-motion` để tạo hiệu ứng trượt từ dưới lên (y: "100%" -> y: 0).
- Hỗ trợ thao tác kéo (drag) xuống để đóng (sử dụng `drag="y"` của framer-motion).
- Xử lý mượt mà khi bàn phím ảo mở (visualViewport API hoặc padding bottom).

## Implementation Steps
1. [ ] Tạo component `ResponsiveDialog.tsx` (hoặc `BottomSheet.tsx`) trong `src/components/ui`.
2. [ ] Tích hợp `AnimatePresence` và các hiệu ứng.
3. [ ] Thêm thanh kéo (drag handle) ở đầu Sheet để báo hiệu cho người dùng có thể vuốt.

## Files to Create/Modify
- `src/components/ui/ResponsiveDialog.tsx` (Tạo mới) - Wrapper component tự động render Modal trên Desktop và Bottom Sheet trên Mobile.

---
Next Phase: phase-03-refactoring.md
