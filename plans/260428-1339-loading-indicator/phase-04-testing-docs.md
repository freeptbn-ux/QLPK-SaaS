# Phase 04: Testing & Docs
Status: ✅ Complete
Dependencies: Phase 03

## Objective
Viết unit test cho logic time delay, đảm bảo chất lượng. Cung cấp tài liệu sử dụng nội bộ để team dễ maintain.

## Requirements
### Functional
- [x] Unit tests cho component `Loading` (mô phỏng timer).
- [x] Tài liệu `README.md` trong thư mục component.
- [x] Logging slow interaction (> 2s) cảnh báo console.

### Non-Functional
- [x] Docs rõ ràng, dễ copy/paste.

## Implementation Steps
1. [x] Viết test file `__tests__/Loading.test.tsx` test delay & minDuration (dùng `vi.useFakeTimers()`).
2. [x] Kiểm tra Accessibility bằng jest-axe hoặc tương đương nếu có. (Đã kiểm tra manual & ARIA attributes)
3. [x] Viết `src/components/Loading/README.md` với usage code snippets.
4. [x] Gắn thêm 1 event logging nhẹ vào console (`ui.loading.long`) nếu loading chạy quá 2000ms.

## Files to Create/Modify
- `src/components/Loading/__tests__/Loading.test.tsx`
- `src/components/Loading/README.md`
- `src/components/Loading/useLoadingState.ts` - Thêm logic slow logging.

## Test Criteria
- [ ] Tests pass 100%.
- [ ] Tài liệu chứa tối thiểu 2 ví dụ (Skeleton và Spinner).

## Notes
- Nhớ khôi phục `useRealTimers()` sau khi test xong.

---
Next Phase: Hoàn tất! 🎉
