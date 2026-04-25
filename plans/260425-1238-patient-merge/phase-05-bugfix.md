# Phase 05: Bug Fix - API & React Keys
Status: ✅ Complete
Dependencies: Phase 04

## Objective
Khắc phục 2 lỗi phát sinh trong quá trình kiểm thử tính năng Gộp bệnh nhân:
1. Lỗi `Failed to fetch potential duplicates` do sai kiểu dữ liệu (Type Mismatch) khi gọi Supabase RPC.
2. Lỗi `Encountered two children with the same key, ""` do sử dụng `<AnimatePresence>` sai cách.

## Requirements
### Functional
- [x] RPC `get_potential_duplicates` phải thực thi thành công và trả về dữ liệu đúng kiểu (`BIGINT` thay vì `INT`).
- [x] Dialog `MergePatientDialog` không còn văng cảnh báo trùng `key` trên React Console.
- [x] Cửa sổ "Dọn trùng" load được danh sách bệnh nhân thật.

## Implementation Steps
1. [x] Cập nhật file SQL `supabase/migrations/006_merge_patients_rpc.sql`:
   - Đổi `patient_ids INT[]` thành `BIGINT[]` trong hàm `get_potential_duplicates`.
   - Đổi tham số `master_id INT`, `duplicate_ids INT[]` thành `BIGINT` trong hàm `merge_patients`.
2. [x] Áp dụng lại file SQL lên Database bằng script `python scripts/apply_sql.py`.
3. [x] Cập nhật file `src/components/features/patients/MergePatientDialog.tsx`:
   - Mang `<ConfirmDialog />` ra KHỎI `<AnimatePresence>`.
   - Thêm `key="merge-dialog"` vào thẻ div con trực tiếp của `<AnimatePresence>`.
   - Bọc toàn bộ bằng React Fragment `<> ... </>`.

## Files to Modify
- `supabase/migrations/006_merge_patients_rpc.sql`
- `src/components/features/patients/MergePatientDialog.tsx`

## Test Criteria
- [ ] Không xuất hiện lỗi ở Console khi mở popup Gộp bệnh nhân.
- [ ] Hết hiện Toast thông báo đỏ "Không thể quét dữ liệu trùng lặp".

---
Next Phase: Finish
