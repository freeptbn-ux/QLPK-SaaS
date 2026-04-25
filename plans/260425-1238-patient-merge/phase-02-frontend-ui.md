# Phase 02: Frontend UI Components
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Tạo giao diện để hiển thị các nhóm bệnh nhân trùng lặp và cho phép Bác sĩ chọn 1 bệnh nhân làm Master ID để gộp.

## Requirements
### Functional
- [ ] Nút "Dọn dẹp hồ sơ trùng" (hoặc icon Quét) trên màn hình Quản lý Bệnh nhân.
- [ ] Component `MergePatientDialog`:
      - Hiển thị danh sách các nhóm bị trùng.
      - Trong mỗi nhóm, liệt kê các ID kèm SĐT, Địa chỉ để dễ phân biệt.
      - Nút "Chọn làm hồ sơ Gốc" (Master) cho từng người.
- [ ] Nút "Thực hiện Gộp" kèm Confirm Dialog báo rõ: "Lịch sử của các ID còn lại sẽ được chuyển hết về ID gốc. Hành động không thể hoàn tác."

### Non-Functional
- [ ] UI nhất quán với Tailwind CSS và dark/light mode của app.
- [ ] Hiển thị skeleton hoặc spinner khi đang quét data.

## Implementation Steps
1. [ ] Tạo file `src/components/features/patients/MergePatientDialog.tsx`.
2. [ ] Sửa file `src/components/features/patients/PatientList.tsx` thêm nút mở Dialog này (cạnh nút Thêm Bệnh nhân).
3. [ ] Xây dựng state quản lý `selectedMasterId` và UI hiển thị danh sách dạng Card hoặc Table nhỏ.

## Files to Create/Modify
- `src/components/features/patients/MergePatientDialog.tsx`
- `src/components/features/patients/PatientList.tsx`

## Test Criteria
- [ ] Dialog mở lên mượt mà, render đúng cấu trúc các nhóm.
- [ ] Nút chọn ID Gốc hoạt động đúng (chỉ cho chọn 1 người làm gốc trong 1 nhóm).

---
Next Phase: [Phase 03](phase-03-integration.md)
