# Phase 05: Client Bundle Optimization

Status: ⬜ Pending  
Dependencies: Phase 04 (cần Suspense structure)  
Effort: ~20 phút  
Fixes: 🟡 Client bundle nặng — PrescriptionHistory 885 dòng + framer-motion

---

## Objective

Giảm JS bundle size của trang `/patients/[id]` bằng dynamic import cho các component nặng.

---

## Vấn đề hiện tại

`PatientDetail.tsx` (`'use client'`) import trực tiếp:
- `PrescriptionHistory` — 885 lines, nhiều state + dialog
- `framer-motion` (AnimatePresence, motion)
- `dayjs`, `react-icons`, `MedicineAutocomplete`
- `PatientFormDialog`, `ConfirmDialog`

Toàn bộ JS phải download + hydrate cùng lúc → TTI tăng.

---

## Implementation Steps

- [ ] **1.1** Dynamic import `PatientFormDialog` trong `PatientDetail.tsx`:
  - Chỉ load khi user bấm "Chỉnh sửa"
  - `const PatientFormDialog = dynamic(() => import('./PatientFormDialog'), { ssr: false })`
- [ ] **1.2** Dynamic import `ConfirmDialog` trong `PatientDetail.tsx`:
  - Chỉ load khi user bấm "Xóa"
- [ ] **1.3** Nếu Phase 04 đã tách `PrescriptionHistory` ra khỏi `PatientDetail`:
  - `PrescriptionHistory` đã được isolate trong `PrescriptionSection` (server component)
  - Kiểm tra xem có cần dynamic import thêm sub-components bên trong PrescriptionHistory không
- [ ] **1.4** Review import `framer-motion`:
  - Nếu chỉ dùng cho expand/collapse trong PrescriptionHistory → đã được isolate ở Phase 04
  - Nếu PatientDetail không dùng framer-motion nữa → remove import
- [ ] **1.5** Test: Kiểm tra bundle size trước/sau bằng `next build` + `@next/bundle-analyzer`
- [ ] **1.6** Test: Tất cả dialogs (edit, delete, append, medicine usage) mở đúng

---

## Files to Modify

| File | Thao tác | Chi tiết |
|------|----------|----------|
| `src/components/features/patients/PatientDetail.tsx` | **Sửa** | Dynamic import dialogs |
| `src/components/features/patients/PrescriptionHistory.tsx` | **Review** | Xem có thể dynamic import sub-dialogs |

---

## Test Criteria

- [ ] Trang load nhanh hơn (ít JS cần download ban đầu)
- [ ] Dialogs mở bình thường khi click (có thể có loading nhỏ ~100ms lần đầu)
- [ ] Không có lỗi hydration mismatch
- [ ] `next build` không có warnings mới

---

## Notes

- Dynamic import với `ssr: false` nghĩa là dialog JS chỉ load khi cần, giảm initial bundle
- Lần đầu click "Chỉnh sửa" có thể chậm ~100ms (download JS), nhưng UX chấp nhận được vì click → delay nhỏ → dialog mở

---

## 📈 Kết quả dự kiến toàn bộ 5 Phases

| Metric | Trước | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|-------|---------|---------|---------|---------|---------|
| TTFB | ~400ms | ~400ms | ~250ms | ~200ms | ~150ms | ~150ms |
| FCP | ~600ms | ~600ms | ~450ms | ~400ms | ~200ms | ~200ms |
| TTI | ~1.2s | ~1.2s | ~1s | ~900ms | ~700ms | ~500ms |
| DB scan | 167 rows | 0 rows | 0 rows | 0 rows | 0 rows | 0 rows |

**Tổng cải thiện ước tính: ~60% nhanh hơn.**
