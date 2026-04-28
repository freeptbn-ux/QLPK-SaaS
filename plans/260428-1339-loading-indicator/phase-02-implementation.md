# Phase 02: Core Implementation
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Hoàn thiện logic của `Loading` component, xử lý UX rules (delay 200ms trước khi hiện, đảm bảo xuất hiện ít nhất 300ms) và các variants hiển thị.

## Requirements
### Functional
- [x] Code logic timeout cho `delay` và `minDuration`.
- [x] Render 4 variants: `skeleton`, `spinner`, `shimmer`, `bar`.
- [x] Tích hợp Accessibility attributes (`role="status"`, `aria-live="polite"`).

### Non-Functional
- [x] UX mượt mà, không bị chớp nháy (flash) nếu API trả về nhanh.
- [x] Screen readers có thể đọc được trạng thái đang tải.

## Implementation Steps
1. [x] Cài đặt state logic `isVisible` và `shouldRender` trong `Loading.tsx` dùng `useEffect` + `setTimeout`.
2. [x] Viết switch case render UI cho từng `variant`.
3. [x] Hoàn thiện `useLoadingState.ts` để kết nối dễ dàng với các hook async hiện tại.
4. [x] Thêm fallback text cho Accessibility.

## Files to Create/Modify
- `src/components/Loading/Loading.tsx` - Thêm logic delay/minDuration
- `src/components/Loading/useLoadingState.ts` - Thêm logic quản lý timeout

## Test Criteria
- [x] Trạng thái load < 200ms không hiện Loading.
- [x] Trạng thái load bật lên sẽ tồn tại ít nhất 300ms dù data trả về sớm.
- [x] Variants hiển thị đúng CSS (kiểm tra manual/storybook nếu có).

## Notes
- Chú ý rò rỉ bộ nhớ (memory leak) với `setTimeout` trong `useEffect` - cần clear timeout khi unmount.

---
Next Phase: [Phase 03: Client Integration](./phase-03-integration.md)
