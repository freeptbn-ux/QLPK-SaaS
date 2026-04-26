# Phase 03: Integration
Status: ✅ Completed
Dependencies: Phase 01, Phase 02

## Objective
Kết nối Giao diện (`MergePatientDialog`) với Logic Backend (`getPotentialDuplicates`, `mergePatients`).

## Requirements
### Functional
- [ ] Khi bật Modal -> hiển thị trạng thái `isLoading` -> gọi API `getPotentialDuplicates`.
- [ ] Bấm nút "Gộp" -> gọi API `mergePatients(masterId, duplicateIds)`.
- [ ] Xử lý Loading state cho nút bấm.
- [ ] Show Toast thành công hoặc thất bại rõ ràng.
- [ ] Gộp xong 1 nhóm -> Xóa nhóm đó khỏi Dialog, hoặc đóng Dialog và gọi hàm `fetchPatients()` ở `PatientList` để tải lại danh sách.

## Implementation Steps
1. [ ] Import các action từ `src/actions/patients.ts` vào Component.
2. [ ] Gắn sự kiện `useEffect` (hoặc button click) để fetch data trùng lặp.
3. [ ] Viết hàm `handleMerge` bắt try-catch đầy đủ.
4. [ ] Gọi lại hàm callback `onSuccess` để Component cha `PatientList` cập nhật data.

## Files to Modify
- `src/components/features/patients/MergePatientDialog.tsx`
- `src/components/features/patients/PatientList.tsx`

## Test Criteria
- [ ] Không có lỗi console khi gộp.
- [ ] Data ở Frontend được tự động làm mới sau khi gộp xong (không cần f5 trình duyệt).

---
Next Phase: [Phase 04](phase-04-testing.md)
