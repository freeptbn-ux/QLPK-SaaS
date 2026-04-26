# Phase 06: Security & Concurrency (DB Constraints + Race Conditions)
Status: ✅ Completed (2026-04-26)
Dependencies: Phase 02 (Zod validation)
Priority: 🟡 MEDIUM

## Objective
Thêm DB-level UNIQUE constraints để ngăn duplicate patients. Fix TOCTOU race condition trong `addPatient`.

## Issues Addressed
- **Issue #8:** TOCTOU Race Condition (MEDIUM) - full fix
- **Issue #9:** Missing DB UNIQUE Constraint (MEDIUM)

## Root Cause Analysis

### TOCTOU Race Condition:
```
Thread A: SELECT ... WHERE name='X' AND dob='Y' → NOT FOUND
Thread B: SELECT ... WHERE name='X' AND dob='Y' → NOT FOUND
Thread A: INSERT → SUCCESS (Patient created)
Thread B: INSERT → SUCCESS (DUPLICATE patient created!)
```

### Missing UNIQUE Constraint:
Database cho phép insert bao nhiêu rows giống nhau tùy ý vì không có UNIQUE constraint.

## Requirements
### Functional
- [ ] DB-level UNIQUE constraint trên `patients(name_normalized, dob)`
- [ ] `addPatient` sử dụng INSERT ... ON CONFLICT (upsert)
- [ ] Date comparison robust (timezone-safe)

### Non-Functional
- [ ] Concurrency safe: 2 requests đồng thời không tạo duplicate
- [ ] Graceful handling: Duplicate → update thay vì error

> **Note:** `stock_quantity` âm được phép theo business rule. Không cần thêm inventory safety check.

## Implementation Steps

### A. Database Constraints

1. [ ] **Cleanup existing duplicates trước khi thêm constraint**
   
   > ⚠️ **Audit đã phát hiện 5 cặp trùng lặp thực sự trong data:**
   
   | name_normalized | IDs trùng | DOB |
   |----------------|-----------|-----|
   | `me cua truong an - vien vien` | 19, 27 | `01/01/1900` |
   | `nguyen quang tung lam` | 86, 146 | `2023-07-28` |
   | `nguyen quang tam` | 626, 663 | `2024-04-16` |
   | `nguyen thi minh khue` | 251, 401 | `2014-11-21` |
   | `van anh tu` | 564, 613 | `2021-12-11` |
   
   ```sql
   -- Tìm tất cả duplicates hiện tại
   SELECT name_normalized, dob, COUNT(*), array_agg(id) as ids
   FROM patients 
   GROUP BY name_normalized, dob 
   HAVING COUNT(*) > 1;
   
   -- Merge từng cặp bằng MergePatientDialog (đã có sẵn trong UI)
   -- Hoặc chạy merge thủ công: chuyển prescriptions rồi xóa bản trùng
   ```

2. [ ] **Thêm UNIQUE constraint**
   ```sql
   -- Migration file
   ALTER TABLE patients 
   ADD CONSTRAINT uq_patients_name_dob 
   UNIQUE (name_normalized, dob);
   ```

3. [ ] **Thêm partial index cho phone (optional)**
   ```sql
   -- Tránh 2 patients có cùng SĐT
   -- Lọc ra giá trị phi-SĐT: 'Chưa cập nhật', 'Hữu Đề', 'Viên viên', v.v.
   CREATE UNIQUE INDEX IF NOT EXISTS uq_patients_phone 
   ON patients (phone) 
   WHERE phone IS NOT NULL 
     AND phone != '' 
     AND phone != 'Chưa cập nhật'
     AND phone ~ '^[0-9]+$';  -- Chỉ áp dụng cho giá trị là SĐT thực
   ```

### B. Fix TOCTOU trong addPatient

4. [ ] **Refactor `addPatient` dùng INSERT ON CONFLICT (upsert)**
   ```typescript
   export async function addPatient(rawData: PatientFormData) {
     const data = patientFormSchema.parse(rawData);
     const nameNormalized = removeDiacritics(data.name);
          const patientData = {
        name: data.name,
        name_normalized: nameNormalized,
        dob: data.dob || '',
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        diagnosis: data.diagnosis,
        weight: data.weight,
        medical_history: data.medical_history,  // NOT allergy_notes (column doesn't exist)
      };
     
     // Dùng upsert - atomic, không có race condition
     const { data: result, error } = await supabase
       .from('patients')
       .upsert(patientData, {
         onConflict: 'name_normalized,dob',
         ignoreDuplicates: false  // update nếu trùng
       })
       .select()
       .single();
     
     if (error) throw new Error('Failed to add/update patient');
     
     // Detect nếu là existing patient (check nếu created_at != updated_at)
     const isExisting = result.created_at !== result.updated_at;
     
     revalidatePath('/patients');
     return { data: result as Patient, isExisting };
   }
   ```

5. [ ] **Alternative: Tạo RPC cho atomic upsert** (nếu Supabase upsert không đủ linh hoạt)
   ```sql
   CREATE OR REPLACE FUNCTION upsert_patient(
     p_name text,
     p_name_normalized text,
     p_dob text,
     p_gender text,
     p_phone text,
     p_address text,
     p_diagnosis text,
     p_weight text,
     p_medical_history text
   )
   RETURNS TABLE(patient_data jsonb, is_existing boolean) AS $$
   DECLARE
     v_patient patients%ROWTYPE;
     v_existing boolean;
   BEGIN
     INSERT INTO patients (name, name_normalized, dob, gender, phone, address, diagnosis, weight, medical_history)
     VALUES (p_name, p_name_normalized, p_dob, p_gender, p_phone, p_address, p_diagnosis, p_weight, p_medical_history)
     ON CONFLICT (name_normalized, dob) DO UPDATE SET
       name = EXCLUDED.name,
       phone = EXCLUDED.phone,
       address = EXCLUDED.address,
       diagnosis = EXCLUDED.diagnosis,
       weight = EXCLUDED.weight,
       medical_history = EXCLUDED.medical_history
     RETURNING * INTO v_patient;
     
     v_existing := (v_patient.created_at != v_patient.updated_at);
     
     RETURN QUERY SELECT to_jsonb(v_patient), v_existing;
   END;
   $$ LANGUAGE plpgsql;
   ```

### C. Date Handling

> ⚠️ **Audit finding:** `dob` field hiện có **6+ format khác nhau** trong data:
> `"2024-01-29"`, `"13 tháng"`, `"01/01/1900"`, `"5 tuổi"`, `"không tuổi"`, `"3,5 tuổi"`
>
> Chỉ các giá trị parseable thành date mới nên normalize. Các giá trị dạng mô tả
> ("13 tháng", "5 tuổi") phải giữ nguyên vì không thể convert thành ngày.

6. [ ] **Fix date string comparison**
   - Đảm bảo `dob` luôn được normalize format trước khi so sánh/insert
   - Chỉ normalize khi giá trị thực sự là date, KHÔNG normalize mô tả tuổi
   ```typescript
   // Trong patientFormSchema:
   dob: z.string().transform(val => {
     if (!val) return '';
     // Chỉ normalize nếu parse được thành date hợp lệ
     // Giữ nguyên giá trị dạng "13 tháng", "5 tuổi" etc.
     const parsed = dayjs(val, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'], true);
     return parsed.isValid() ? parsed.format('YYYY-MM-DD') : val;
   }),
   ```

## Files to Create/Modify
- `supabase/migrations/XXXXXX_patient_unique_constraint.sql` - **NEW** UNIQUE constraint
- `src/actions/patients.ts` - Refactor `addPatient` to use upsert
- `src/lib/validations/patient.ts` - Add date normalization
- `supabase/migrations/XXXXXX_upsert_patient_rpc.sql` - **NEW** (optional) Upsert RPC

## Test Criteria
- [ ] 2 concurrent `addPatient` with same data → only 1 patient created
- [ ] `addPatient` with existing name+dob → updates existing, returns `isExisting: true`
- [ ] DB rejects manual INSERT of duplicate `(name_normalized, dob)`
- [ ] Date format "19/04/2026" và "2026-04-19" both work correctly

## Notes
- **⚠️ IMPORTANT:** Phải cleanup 5 cặp duplicate TRƯỚC khi thêm UNIQUE constraint, nếu không migration sẽ fail
- Dùng `MergePatientDialog` (đã có sẵn trong UI) để merge từng cặp
- `created_at` vs `updated_at` comparison chỉ hoạt động nếu DB tự set `updated_at` trigger
- Verify Supabase có auto-update `updated_at` column hay không
- Column `allergy_notes` **KHÔNG tồn tại** trong DB — dùng `medical_history` thay thế
- `weight` là **text** trong DB (không phải number) — ví dụ: `'10'`, `'8.5'`, `'18kg'`, `'Unknown'`
- `phone` có giá trị phi-SĐT: `'Chưa cập nhật'`, `'Hữu Đề'`, `'Viên viên'`, `'Nhà đối diện'` — partial index phải lọc

---
Previous Phase: [phase-05-data-fetching-optimization.md](./phase-05-data-fetching-optimization.md)
Next Phase: [phase-07-testing-verification.md](./phase-07-testing-verification.md)
