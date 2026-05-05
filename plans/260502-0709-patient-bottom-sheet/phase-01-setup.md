# Phase 01: Setup & Architecture
Status: ⬜ Pending
Dependencies: None

## Objective
Xác định cấu trúc component cho Bottom Sheet và chuẩn bị các tiện ích cần thiết (ví dụ: Hook để nhận diện Mobile vs Desktop).

## Requirements
### Functional
- Cần một hook `useMediaQuery` để xác định người dùng đang dùng Mobile (nhỏ hơn `md` breakpoint - 768px/900px tùy theme).
- Nếu là Desktop, giữ nguyên giao diện Modal căn giữa.
- Nếu là Mobile, sử dụng Bottom Sheet.

## Implementation Steps
1. [ ] Tạo file `src/hooks/useMediaQuery.ts`.
2. [ ] Phân tích file `globals.css` để lấy giá trị breakpoint chuẩn của dự án (ví dụ: `--breakpoint-md: 900px`).

## Files to Create/Modify
- `src/hooks/useMediaQuery.ts` - Custom hook để detect màn hình.

---
Next Phase: phase-02-ui-component.md
