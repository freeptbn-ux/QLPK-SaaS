# Phase 03: UI Adaptation - Cập nhật giao diện
Status: ✅ Completed
Dependencies: Phase 01, Phase 02

## Objective
Cập nhật UI components để phản ánh đúng data sau khi gộp:
1. PatientList hiển thị đúng (1 row per person)
2. PatientDetail hiển thị TẤT CẢ lịch sử khám bệnh
3. PrescriptionHistory hiển thị số lượng đúng

## Implementation Steps

### Step 1: Cập nhật PatientList columns
- [x] File: `src/components/features/patients/PatientList.tsx`

Sau khi gộp, cột "Chẩn đoán" sẽ hiển thị chẩn đoán GẦN NHẤT (field `diagnosis`).
Đây đã là behavior hiện tại → **Không cần thay đổi**.

### Step 2: Verify PatientDetail
- [x] File: `src/components/features/patients/PatientDetail.tsx`

Hiện tại đang truyền `currentPatient.prescriptions` vào `PrescriptionHistory`.
Sau gộp, prescriptions sẽ chứa TẤT CẢ lượt khám → **Tự động đúng**.

Cần verify:
- "Chẩn đoán gần nhất" hiển thị chẩn đoán mới nhất
- "Lịch sử khám bệnh (X lần)" hiển thị đúng tổng số

### Step 3: Verify PrescriptionHistory
- [x] File: `src/components/features/patients/PrescriptionHistory.tsx`

Hiện tại đã sort prescriptions theo `prescription_date` DESC.
Sau gộp, sẽ có nhiều prescriptions hơn → **Tự động đúng**.

### Step 4: Cập nhật MedicineUsageDialog
- [x] File: `src/components/features/patients/MedicineUsageDialog.tsx`

Hiện tại query `getMedicineUsageByPatient(patientId)`.
Sau gộp, sẽ tự động tính usage từ TẤT CẢ prescriptions → **Tự động đúng**.

### Step 5: Cập nhật PatientFormDialog
- [x] File: `src/components/features/patients/PatientFormDialog.tsx`

Khi tạo patient mới:
- Nếu `addPatient` trả về existing patient → hiển thị thông báo
  "Bệnh nhân đã tồn tại trong hệ thống, đã cập nhật thông tin."
  thay vì "Thêm bệnh nhân thành công."

## Files to Create/Modify
- `src/components/features/patients/PatientFormDialog.tsx` - Thông báo khi patient đã tồn tại
- (Các file khác chỉ cần verify, không cần sửa code)

## Test Criteria
- [x] Danh sách bệnh nhân: Mỗi người chỉ xuất hiện 1 lần
- [x] Chi tiết bệnh nhân: Hiển thị TẤT CẢ lượt khám (không chỉ 1-2)
- [x] "Nguyễn Quang Tùng Lâm" → "Lịch sử khám bệnh (11 lần)" (hoặc tương đương)
- [x] "Lịch sử dùng thuốc" tổng hợp từ TẤT CẢ đơn thuốc
- [x] Tạo bệnh nhân trùng tên+dob → thông báo đã tồn tại

## Notes
- Phần lớn UI sẽ tự động đúng sau Phase 01 (database fix)
- Phase này chủ yếu là **verify** + minor UX improvements

---
Next Phase: [phase-04-verification.md](./phase-04-verification.md)
