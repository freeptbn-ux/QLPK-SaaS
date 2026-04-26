# Phase 04: Verification & Smoke Test
Status: ✅ Done
Dependencies: Phase 01, Phase 02, Phase 03

## Objective
Xác nhận end-to-end rằng tất cả fixes từ Phase 01-03 hoạt động đúng: prescription flow không lỗi, revenue không bị double-count, và migration runner hoàn chỉnh.

## Requirements
### Functional
- [x] Flow "Kê đơn mới" hoàn tất không lỗi
- [x] Revenue statistics chính xác
- [x] Tất cả RPC functions đều callable

### Non-Functional
- [x] Build Next.js thành công (no compile errors)
- [x] Không có regression trên các features khác

## Implementation Steps

### Step 1: Database state verification
1. [x] Chạy diagnostic query kiểm tra tất cả functions tồn tại:
   ```sql
   SELECT proname, pg_get_function_arguments(oid) as args
   FROM pg_proc 
   WHERE pronamespace = 'public'::regnamespace
     AND proname LIKE 'get_%' OR proname IN ('create_prescription', 'append_to_prescription', 'merge_patients', 'upsert_patient')
   ORDER BY proname;
   ```
2. [x] Kiểm tra permissions đã được cấp:
   ```sql
   SELECT routine_name, grantee, privilege_type
   FROM information_schema.routine_privileges
   WHERE routine_schema = 'public'
     AND routine_name IN ('create_prescription', 'get_revenue_stats')
   ORDER BY routine_name, grantee;
   ```

### Step 2: Smoke test — Prescription flow
1. [x] Truy cập `localhost:3000/patients/[id]/prescribe` (chọn patient ID hợp lệ)
2. [x] Nhập chẩn đoán
3. [x] Chọn ít nhất 1 loại thuốc
4. [x] Bấm "Lưu đơn thuốc"
5. [x] **Expected:** Redirect về `/patients/[id]`, đơn thuốc mới xuất hiện trong lịch sử
6. [x] **Không được thấy:** "Could not find the function..." error

### Step 3: Smoke test — Revenue statistics
1. [x] Truy cập dashboard thống kê
2. [x] So sánh revenue figure với manual calculation:
   ```sql
   SELECT 
     SUM(total_amount) as correct_revenue,
     SUM(total_amount + COALESCE(consultation_fee, 0)) as old_inflated_revenue
   FROM prescriptions_header
   WHERE prescription_date >= '2026-04-01' AND prescription_date < '2026-05-01';
   ```
3. [x] Dashboard phải hiển thị `correct_revenue`, không phải `old_inflated_revenue`

### Step 4: Smoke test — Other RPCs
1. [x] Verify trang thống kê (charts) load được data
2. [x] Verify tìm kiếm bệnh nhân hoạt động
3. [x] Verify thêm bệnh nhân mới hoạt động (sử dụng `upsert_patient` RPC)

### Step 5: Build verification
1. [x] Chạy `npm run build` — phải thành công
2. [x] Không có TypeScript errors mới
3. [x] Không có lint warnings mới

### Step 6: Cập nhật plan status
1. [x] Đánh dấu tất cả phases ✅ Complete
2. [x] Tạo final report trong `reports/` folder

## Files to Create/Modify
- `plans/260426-1457-prescription-rpc-fix/reports/final-report.md` — **Tạo mới** sau khi verify

## Test Criteria
- [x] "Lưu đơn thuốc" flow: ✅ hoàn tất không lỗi
- [x] Revenue statistics: ✅ khớp với `SUM(total_amount)`
- [x] Dashboard charts: ✅ hiển thị dữ liệu
- [x] Patient search: ✅ trả kết quả
- [x] `npm run build`: ✅ thành công
- [x] Không có regression trên features khác

## Notes
- Nếu Step 2 vẫn lỗi sau Phase 01, kiểm tra:
  1. Đã chạy `NOTIFY pgrst, 'reload schema'` chưa?
  2. Function signature trong GRANT có khớp chính xác với `pg_proc` không?
  3. Server đã restart chưa? (Next.js dev server cache có thể cần clear)

---
**🎉 Hoàn tất plan! Tạo final report khi tất cả tests pass.**
