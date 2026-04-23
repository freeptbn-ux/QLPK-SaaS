# Phase 02: Tích hợp DateInput & Cập nhật Validation

Status: ✅ Completed
Dependencies: Phase 01 (DateInput component)

## Objective

Gắn component `DateInput` vào `PatientFormDialog`, cập nhật Zod schema để validate format DD/MM/YYYY, và đảm bảo logic match bệnh nhân trùng lặp vẫn hoạt động đúng.

## Requirements

### Functional
- [ ] Thay thế `TextField` dob trong `PatientFormDialog.tsx` bằng `DateInput`
- [ ] Cập nhật Zod schema: validate `dob` phải đúng format `DD/MM/YYYY`
- [ ] Validate ngày hợp lệ (DD: 01-31, MM: 01-12, YYYY: 1900-2099)
- [ ] Validate thông minh (VD: tháng 2 không có ngày 30, tháng 4 không có ngày 31)
- [ ] Trường `dob` vẫn là optional (có thể để trống)
- [ ] Khi edit bệnh nhân cũ → parse giá trị cũ vào DateInput (nếu đúng format)
- [ ] Khi edit bệnh nhân cũ có dob dạng cũ (VD: `1990`) → hiển thị thông báo nhỏ "Format cũ, vui lòng nhập lại"

### Non-Functional
- [ ] Không break chức năng addPatient / updatePatient hiện tại
- [ ] Không ảnh hưởng logic check trùng lặp bệnh nhân

## Implementation Steps

### 1. Cập nhật Zod Schema

- [ ] Sửa `src/lib/validations/patient.ts`

```typescript
// TRƯỚC:
dob: z.string().optional(),

// SAU:
dob: z.string()
  .optional()
  .refine(
    (val) => {
      if (!val || val === '') return true;  // Cho phép trống
      // Phải đúng format DD/MM/YYYY
      const regex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regex.test(val)) return false;
      // Validate ngày hợp lệ
      const [dd, mm, yyyy] = val.split('/').map(Number);
      if (mm < 1 || mm > 12) return false;
      if (dd < 1 || dd > 31) return false;
      if (yyyy < 1900 || yyyy > 2100) return false;
      // Check ngày trong tháng
      const date = new Date(yyyy, mm - 1, dd);
      return date.getDate() === dd && date.getMonth() === mm - 1;
    },
    { message: 'Ngày sinh không hợp lệ (DD/MM/YYYY)' }
  ),
```

### 2. Cập nhật PatientFormDialog

- [ ] Sửa `src/components/features/patients/PatientFormDialog.tsx`

```diff
// Import DateInput
+ import DateInput from '@/components/ui/DateInput';

// Thay thế TextField dob (line 128-140)
- <Controller
-   name="dob"
-   control={control}
-   render={({ field }) => (
-     <TextField
-       {...field}
-       label="Ngày sinh / Tuổi (Ví dụ: 1990 hoặc 12 tháng)"
-       fullWidth
-       slotProps={{ inputLabel: { shrink: true } }}
-     />
-   )}
- />
+ <Controller
+   name="dob"
+   control={control}
+   render={({ field }) => (
+     <DateInput
+       value={field.value || ''}
+       onChange={field.onChange}
+       label="Ngày sinh"
+       error={!!errors.dob}
+       helperText={errors.dob?.message}
+     />
+   )}
+ />
```

### 3. Xử lý data cũ khi edit

- [ ] Trong `useEffect` reset form, thêm logic detect format cũ:

```typescript
// Nếu patient.dob là format cũ (VD: "1990", "12 tháng")
// → không set vào DateInput (để trống), hiển thị warning
const isOldFormat = patient.dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(patient.dob);
if (isOldFormat) {
  // Set dob = '' để user nhập lại
  // Có thể thêm state `oldDobWarning` để hiện thông báo
}
```

### 4. Đảm bảo logic addPatient vẫn match đúng

- [ ] Review `src/actions/patients.ts` → Logic `.eq('dob', data.dob || '')` 
- [ ] Sau khi migration data cũ (Phase 03), format đã đồng nhất → match OK

## Files to Create/Modify

| File | Action | Mô tả |
|------|--------|--------|
| `src/lib/validations/patient.ts` | **MODIFY** | Thêm refine validate DD/MM/YYYY |
| `src/components/features/patients/PatientFormDialog.tsx` | **MODIFY** | Thay TextField → DateInput |

## Test Criteria

- [ ] Mở dialog "Thêm bệnh nhân mới" → trường Ngày sinh hiển thị 3 ô DD/MM/YYYY
- [ ] Nhập ngày hợp lệ `15/06/1990` → Submit thành công
- [ ] Nhập ngày sai `32/13/2025` → Hiện lỗi "Ngày sinh không hợp lệ"
- [ ] Để trống dob → Submit thành công (optional field)
- [ ] Nhập `29/02/2024` (năm nhuận) → Hợp lệ
- [ ] Nhập `29/02/2023` (không nhuận) → Không hợp lệ
- [ ] Edit bệnh nhân có dob format cũ (`1990`) → Ô để trống, có warning
- [ ] Edit bệnh nhân có dob đúng format (`15/06/1990`) → Hiển thị đúng

## Notes

- Zod `refine` chạy sau các validation khác → nếu `dob` là `undefined` hoặc `''`, refine sẽ return true (bỏ qua)
- Cần test kỹ trường hợp edit bệnh nhân cũ vì data cũ có nhiều format khác nhau

---
Next Phase: → phase-03-data-migration-test.md (Chuẩn hóa dữ liệu cũ & Kiểm thử)
