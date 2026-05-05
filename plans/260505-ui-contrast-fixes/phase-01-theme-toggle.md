# Phase 01: Fix Theme Toggle Visibility
Status: ✅ Done
Dependencies: None

## Objective
Sửa lỗi icon chỉnh theme khó nhìn trong chế độ Dark Mode.

## Analysis
- File: `src/components/features/TopBar.tsx`
- Vấn đề: Icon Sun/Moon đang sử dụng class `text-foreground`. Trong Dark Mode, `text-foreground` (biến `--foreground`) có thể không đổi sang màu sáng nếu không được định nghĩa đúng variant hoặc bị override bởi giá trị mặc định của CSS.
- Giải pháp: Sử dụng màu sắc tương phản cao hơn hoặc đảm bảo `dark:text-white` được áp dụng.

## Tasks
- [ ] Chỉnh sửa `src/components/features/TopBar.tsx`
- [ ] Thay đổi class của `HiOutlineSun` và `HiOutlineMoon` để hiển thị rõ hơn trong cả hai chế độ.
- [ ] Đề xuất: dùng `text-slate-600 dark:text-amber-400` cho Sun và `text-slate-600 dark:text-slate-300` cho Moon (hoặc tương tự).

## Files to Modify
- `src/components/features/TopBar.tsx`

## Test Criteria
- [ ] Chuyển sang Dark Mode, icon Sun phải sáng và dễ nhìn.
- [ ] Chuyển sang Light Mode, icon Moon phải tối và dễ nhìn.
