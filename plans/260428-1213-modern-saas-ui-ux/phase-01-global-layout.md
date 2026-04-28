# Phase 01: Global Layout & Spacing
Status: ✅ Completed

## Objective
Thiết lập cấu trúc nền tảng của giao diện Modern SaaS trên toàn bộ các trang. Thay đổi màu nền tổng thể để làm nổi bật các khối nội dung (Cards).

## Requirements
### Functional & Non-Functional
- [ ] Áp dụng nền xám nhạt (`bg-slate-50`) cho toàn bộ App Shell / Main Layout thay vì nền trắng bẹt.
- [ ] Cập nhật Sidebar / Header để có độ tương phản hợp lý (nền trắng `bg-white`, có viền nhẹ hoặc bóng mờ `shadow-sm`).
- [ ] Cập nhật wrapper chính của các trang để có padding chuẩn (ví dụ `p-4 md:p-6`) và gap giữa các khối (ví dụ `gap-6`).
- [ ] Đảm bảo layout Responsive không bị vỡ trên màn hình Mobile.

## Implementation Steps
1. [ ] Kiểm tra và cập nhật `app/layout.tsx` (hoặc Component Layout bao ngoài cùng) thêm `bg-slate-50`.
2. [ ] Kiểm tra Sidebar/Header, thêm bóng đổ và đường viền siêu mỏng nếu cần.
3. [ ] Cập nhật wrapper nội dung ở các file page để chứa các khối Card, đảm bảo khoảng cách giữa các phần tử đồng đều.

## Files to Create/Modify
- `src/app/layout.tsx`
- `src/components/layout/Sidebar.tsx` / `Header.tsx` (Tên file cụ thể sẽ tìm sau)
- Thẻ wrapper ở `src/app/(dashboard)/*/page.tsx`

---
Next Phase: phase-02-core-components.md
