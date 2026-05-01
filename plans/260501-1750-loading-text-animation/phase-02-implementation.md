# Phase 02: Implementation
Status: ✅ Done
Dependencies: Phase 01

## Objective
Thực thi thay đổi UI từ Spinner sang Animated Text và fix bug logic.

## Implementation Steps
1. [ ] Cập nhật `Loading.module.css`: Thêm class CSS cho hiệu ứng nhấp nháy 3 dấu chấm bằng CSS Animations (độ trễ `animation-delay` hoặc `clip-path`).
2. [ ] Sửa đổi file `Loading.tsx`: Thay HTML của `spinner` variant thành chữ `Loading<span className={styles.dots}>...</span>`.
3. [ ] Sửa đổi `useLoadingState.ts`: Cải thiện mảng dependencies để `slowLoadingTimerRef` không bị xóa sai thời điểm và cảnh báo hoạt động bình thường.
4. [ ] Cập nhật `MergePatientDialog.tsx`: Đồng bộ vòng xoay "chay" về Component `Loading` chuẩn của hệ thống.

## Files to Modify
- `src/components/Loading/Loading.module.css`
- `src/components/Loading/Loading.tsx`
- `src/components/Loading/useLoadingState.ts`
- `src/components/features/patients/MergePatientDialog.tsx`

---
Next Phase: `phase-03-testing.md`
