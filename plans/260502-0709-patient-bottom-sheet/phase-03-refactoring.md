# Phase 03: Refactor Patient Form
Status: ⬜ Pending
Dependencies: phase-02-ui-component.md

## Objective
Áp dụng `ResponsiveDialog` / `BottomSheet` vào `PatientFormDialog`.

## Requirements
### Functional
- Thay thế toàn bộ mã Modal tĩnh trong `PatientFormDialog.tsx`.
- Form cần được bọc trong vùng nội dung có thể cuộn được (`overflow-y-auto`).
- Đảm bảo header và các nút Save/Cancel không bị che lấp.

## Implementation Steps
1. [ ] Cập nhật `src/components/features/patients/PatientFormDialog.tsx`.
2. [ ] Loại bỏ logic `framer-motion` cũ trong file này và sử dụng từ `ResponsiveDialog`.
3. [ ] Căn chỉnh lại padding/margin cho phù hợp với cả 2 chế độ (Mobile & Desktop).

## Files to Modify
- `src/components/features/patients/PatientFormDialog.tsx`

---
Next Phase: phase-04-testing.md
