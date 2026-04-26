# Phase 02: Server Action Hardening (Zod Validation + Safety)
Status: ✅ DONE
Dependencies: Phase 01 (SQL RPCs phải sẵn sàng)
Priority: 🔴 HIGH

## Objective
Thêm Zod schema validation vào tất cả Server Actions để chặn Mass Assignment attacks. Sửa logic `addPatient` để tránh spread trực tiếp `data` vào database payload.

## Issues Addressed
- **Issue #7:** Missing Server-Side Validation / Mass Assignment (HIGH)
- **Issue #13:** Floating Point Math (LOW)
- **Issue #8:** TOCTOU Race Condition (MEDIUM) - partial fix

## Root Cause Analysis
```typescript
// HIỆN TẠI - NGUY HIỂM
export async function addPatient(data: PatientFormData) {
  const patientData = {
    ...data,  // ← Mass Assignment! Client có thể inject `id`, `role`, etc.
    name_normalized: nameNormalized,
  };
  await supabase.from('patients').insert([patientData]);
}
```

TypeScript types biến mất ở runtime. Nếu client gửi thêm field bất kỳ (vd: `{...data, id: 1, is_admin: true}`), chúng sẽ được insert thẳng vào DB.

## Requirements
### Functional
- [ ] Tạo Zod schemas cho tất cả form data types
- [ ] Parse + validate input trong mỗi Server Action
- [ ] Whitelist chỉ các fields cho phép (không spread nguyên `data`)

### Non-Functional
- [ ] Security: Chặn 100% mass assignment vectors
- [ ] DX: Error messages rõ ràng, tiếng Việt

## Implementation Steps

1. [ ] **Tạo file `src/lib/validations/patient.ts`** - Zod schemas cho Patient
   ```typescript
   import { z } from 'zod';
   
   export const patientFormSchema = z.object({
     name: z.string().min(1, 'Tên không được để trống').max(200),
     dob: z.string().optional().default(''),
     gender: z.string().optional().default(''),
     phone: z.string().optional().default(''),
     address: z.string().optional().default(''),
     diagnosis: z.string().optional().default(''),
     weight: z.string().optional().default(''),  // DB stores as text, not number
     medical_history: z.string().optional().default(''),
   });
   
   // NOTE: Column `allergy_notes` does NOT exist in DB.
   //       Column `medical_history` is the correct field.
   export type ValidatedPatientData = z.infer<typeof patientFormSchema>;
   ```

2. [ ] **Tạo file `src/lib/validations/prescription.ts`** - Zod schemas cho Prescription
   ```typescript
   import { z } from 'zod';
   
   export const prescriptionItemSchema = z.object({
     medicine_id: z.number().int().positive(),
     medicine_name: z.string(),
     packing_spec: z.string(),
     quantity: z.number().int().positive('Số lượng phải > 0'),
     unit_price: z.number().nonnegative(),
   });
   
   export const createPrescriptionSchema = z.object({
     patient_id: z.number().int().positive(),
     diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán'),
     items: z.array(prescriptionItemSchema).min(1, 'Cần ít nhất 1 loại thuốc'),
     notes: z.string().optional().default(''),
     consultation_fee: z.number().nonnegative(),
   });
   ```

3. [ ] **Tạo file `src/lib/validations/medicine.ts`** - Zod schemas cho Medicine
   ```typescript
   import { z } from 'zod';
   
   export const medicineFormSchema = z.object({
     name: z.string().min(1, 'Tên thuốc không được để trống'),
     packing_spec: z.string().optional().default(''),
     price: z.number().nonnegative('Giá phải >= 0'),
     stock_quantity: z.number().int().optional(),  // Cho phép âm theo business rule
     min_stock_level: z.number().int().nonnegative().optional(),
     usage_instructions: z.string().optional().default(''),
   });
   ```

4. [ ] **Refactor `addPatient()` trong `patients.ts`**
   - Parse input qua `patientFormSchema.parse(data)`
   - Build insert payload bằng tay (whitelist fields)
   - Không spread raw `data`
   ```typescript
   export async function addPatient(rawData: PatientFormData) {
     const data = patientFormSchema.parse(rawData);
     const nameNormalized = removeDiacritics(data.name);
     
     // Whitelist - chỉ insert các fields được phép
     const patientData = {
       name: data.name,
       name_normalized: nameNormalized,
       dob: data.dob,
       gender: data.gender,
       phone: data.phone,
       address: data.address,
       diagnosis: data.diagnosis,
       weight: data.weight,
       medical_history: data.medical_history,
     };
     // ... rest of logic
   }
   ```

5. [ ] **Refactor `updatePatient()` trong `patients.ts`**
   - Tương tự, parse + whitelist fields

6. [ ] **Refactor `createPrescription()` trong `prescriptions.ts`**
   - Parse input qua `createPrescriptionSchema.parse(data)`
   - Đảm bảo `items` array chỉ chứa fields hợp lệ

7. [ ] **Add Zod validation cho `medicines.ts`**
   - Parse tất cả mutations (add/update medicine)

8. [ ] **Error handling wrapper**
   - Tạo helper function xử lý Zod errors thành user-friendly messages
   ```typescript
   // src/lib/validations/helpers.ts
   export function formatZodError(error: z.ZodError): string {
     return error.issues.map(i => i.message).join(', ');
   }
   ```

9. [ ] **Fix floating point cho currency** (optional, low priority)
   - Dùng `Math.round()` cho phép tính tiền
   ```typescript
   const lineTotal = Math.round(item.quantity * item.unit_price);
   ```

## Files to Create/Modify
- `src/lib/validations/patient.ts` - **NEW** Zod schemas
- `src/lib/validations/prescription.ts` - **NEW** Zod schemas
- `src/lib/validations/medicine.ts` - **NEW** Zod schemas
- `src/lib/validations/helpers.ts` - **NEW** Error formatting
- `src/actions/patients.ts` - Refactor addPatient/updatePatient
- `src/actions/prescriptions.ts` - Refactor createPrescription
- `src/actions/medicines.ts` - Refactor add/update mutations

## Test Criteria
- [ ] `addPatient({name: "Test", id: 999, role: "admin"})` → `id` và `role` bị loại bỏ
- [ ] `addPatient({})` → Zod error: "Tên không được để trống"
- [ ] `createPrescription({...valid, items: []})` → Zod error: "Cần ít nhất 1 loại thuốc"
- [ ] Tất cả existing form flows vẫn hoạt động bình thường

## Notes
- Zod v4 đã có sẵn trong `package.json` ✅ 
- Không cần install thêm dependencies
- TOCTOU race condition sẽ được fix triệt để hơn ở Phase 06 (DB-level UNIQUE constraint)

---
Previous Phase: [phase-01-database-optimization.md](./phase-01-database-optimization.md)
Next Phase: [phase-03-nextjs-architecture.md](./phase-03-nextjs-architecture.md)
