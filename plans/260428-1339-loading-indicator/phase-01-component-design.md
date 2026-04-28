# Phase 01: Component Design & Setup
Status: ✅ Complete
Dependencies: None

## Objective
Tạo bộ khung cấu trúc thư mục, định nghĩa API (props) cho component `Loading`, và chuẩn bị styles cơ bản (TailwindCSS / CSS).

## Requirements
### Functional
- [x] Khởi tạo thư mục `src/components/Loading/`
- [x] Định nghĩa các props (`variant`, `size`, `delay`, `minDuration`, `className`, `ariaLabel`)
- [x] Setup hook `useLoadingState`

### Non-Functional
- [x] Architecture clean
- [x] Styles modular (hỗ trợ dark mode nếu có, animation mượt)

## Implementation Steps
1. [x] Tạo `src/components/Loading/Loading.tsx` với bộ khung props.
2. [x] Tạo `src/components/Loading/useLoadingState.ts`.
3. [x] Định nghĩa file CSS (hoặc cấu hình Tailwind) cho các animation (spin, pulse, shimmer).
4. [x] Tạo file export `index.ts`.

## Files to Create/Modify
- `src/components/Loading/Loading.tsx` - Component chính
- `src/components/Loading/useLoadingState.ts` - Custom hook quản lý state
- `src/components/Loading/index.ts` - Export dễ dàng
- `src/components/Loading/Loading.module.css` (nếu dùng CSS modules)

## Test Criteria
- [x] Component renders không có lỗi.
- [x] CSS animations cơ bản đã được định nghĩa.

## Notes
- Giữ cấu trúc file gọn gàng.
- Đảm bảo animation hỗ trợ prefers-reduced-motion.

---
Next Phase: [Phase 02: Core Implementation](./phase-02-implementation.md)
