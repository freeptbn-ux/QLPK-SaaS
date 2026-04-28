# Phase 02: Core Components & Typography
Status: ⬜ Pending
Dependencies: phase-01-global-layout.md

## Objective
Đồng bộ hóa các thành phần giao diện dùng chung (Button, Card, Input, Typography) theo phong cách Modern SaaS: bo góc lớn, đổ bóng mềm và phân cấp font chữ rõ ràng.

## Requirements
### Functional & Non-Functional
- [ ] Typography: Tăng độ tương phản của tiêu đề (H1/H2 dùng `text-slate-900 font-bold`), làm dịu văn bản phụ trợ (dùng `text-slate-500`).
- [ ] Card: Các khối nội dung phải được bọc trong Card với `bg-white`, `rounded-xl` (hoặc `rounded-2xl`), `shadow-sm`, và border siêu mỏng `border-slate-100`.
- [ ] Button: Làm mượt thiết kế nút bấm, thêm hiệu ứng `hover:opacity-90`, `active:scale-95`. Các nút hành động nguy hiểm phải có màu cảnh báo (đỏ).
- [ ] Inputs: Tăng chiều cao/padding của thẻ input, border khi focus phải sử dụng màu Primary Blue (`focus:ring-blue-500`).

## Implementation Steps
1. [ ] Khảo sát hệ thống Components dùng chung (thường nằm ở `src/components/ui/` hoặc `components/shared/`).
2. [ ] Cập nhật CSS class cho Card, Button, Input để đạt Vibe mới.
3. [ ] Cập nhật toàn bộ thẻ Header / Title trên các trang chính (`/patients`, `/medicines`) để áp dụng Hierarchy chuẩn.

## Files to Create/Modify
- Các file trong thư mục chứa UI Components.
- Các file page chính (`page.tsx`) để bọc thẻ Card nếu trước đó nội dung đang bị thả nổi.

---
Next Phase: phase-03-data-tables.md
