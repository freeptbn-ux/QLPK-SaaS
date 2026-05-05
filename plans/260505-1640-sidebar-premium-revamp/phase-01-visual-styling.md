# Phase 01: Visual Styling & Design System
Status: ⬜ Pending
Dependencies: None

## Objective
Áp dụng Design System mới (Cyan Healthcare Vibe) và nâng cấp thẩm mỹ cho các thành phần của Sidebar mà không thay đổi cấu trúc menu hiện tại (giữ nguyên 5 mục).

## Requirements
### Functional
- [ ] Thay thế `react-icons/hi2` bằng `lucide-react` cho 5 menu hiện tại.
- [ ] Áp dụng bảng màu: Primary (#0891B2), Background (#ECFEFF), Text (#164E63).
- [ ] Thiết kế lại "Active State" với indicator line hoặc hiệu ứng background tinh tế hơn.

### Non-Functional
- [ ] Sử dụng font "DM Sans" (hoặc font hiện tại của project nhưng tối ưu typography).
- [ ] Đảm bảo độ tương phản (Contrast ratio) đạt chuẩn 4.5:1.

## Implementation Steps
1. [ ] **Update Icons**: Chuyển đổi toàn bộ icon sang Lucide.
2. [ ] **Apply Colors**: Cập nhật CSS/Tailwind classes cho sidebar container và nav items.
3. [ ] **Enhance Hover/Active States**: Thêm transition, shadow subtle, và hiệu ứng focus chuyên nghiệp.
4. [ ] **Typography Polishing**: Điều chỉnh font-size, font-weight và line-height cho menu labels.

## Files to Create/Modify
- `src/components/features/Sidebar.tsx` - Apply styles and new icons.

## Test Criteria
- [ ] Sidebar có giao diện hiện đại, màu sắc hài hòa với ngành y tế.
- [ ] Trạng thái Active rõ ràng nhưng tinh tế.
- [ ] Kiểm tra Dark Mode (đảm bảo vẫn đẹp và dễ đọc).

---
Next Phase: [Phase 02: Collapsible Mode & Tooltips](./phase-02-interactive-features.md)
