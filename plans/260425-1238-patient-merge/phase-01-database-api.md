# Phase 01: Database & API Action
Status: ⬜ Pending
Dependencies: None

## Objective
Viết logic Server Action hoặc Supabase RPC để an toàn gộp các hồ sơ bệnh nhân mà không làm mất lịch sử khám bệnh.

## Requirements
### Functional
- [ ] Viết hàm `getPotentialDuplicates()`: Quét và trả về các nhóm bệnh nhân có cùng (name_normalized, dob, phone) mà số lượng trong nhóm > 1.
- [ ] Viết hàm `mergePatients(masterId, duplicateIds)`:
      1. Cập nhật bảng `prescriptions_header`: đổi `patient_id` của các hóa đơn thuộc `duplicateIds` sang `masterId`.
      2. Xóa các bệnh nhân trong danh sách `duplicateIds`.
- [ ] Xử lý an toàn: Sử dụng transaction hoặc RPC để tránh việc xóa bệnh nhân khi chưa update xong đơn thuốc.

### Non-Functional
- [ ] Bảo mật: Chỉ xử lý trên server, bắt try/catch log lỗi đầy đủ.

## Implementation Steps
1. [ ] Cập nhật file `src/actions/patients.ts` thêm 2 hàm trên.
2. [ ] (Tuỳ chọn) Tạo Supabase RPC `merge_patients` nếu việc gọi 2 lệnh rời (Update rồi Delete) có rủi ro timeout. Do Supabase client JS không hỗ trợ transaction, RPC là cách an toàn nhất.

## Files to Modify
- `src/actions/patients.ts`

## Test Criteria
- [ ] API quét đúng các nhóm trùng.
- [ ] API chạy gộp và trả về status `success`.

---
Next Phase: [Phase 02](phase-02-frontend-ui.md)
