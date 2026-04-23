# Phase 02: Query Logic Update - Cập nhật Server Actions
Status: ✅ Completed
Dependencies: Phase 01 (DB Consolidation)

## Objective
Sau khi gộp patients, cập nhật server actions để:
1. Đảm bảo `getPatientById` trả về TẤT CẢ prescriptions (đã tự động nhờ Phase 01)
2. Cập nhật `createPrescription` để KHÔNG tạo patient mới khi kê đơn
3. Thêm unique constraint ngăn duplicate trong tương lai
4. Cập nhật `getMedicineUsageByPatient` (đã đúng, chỉ cần verify)

## Implementation Steps

### Step 1: Thêm unique constraint cho patients
- [x] File: `supabase/migrations/005_unique_patient_constraint.sql`

```sql
-- Ngăn tạo duplicate patients trong tương lai
-- Unique trên (name_normalized, dob) - case insensitive
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_unique_person 
ON patients (LOWER(name_normalized), COALESCE(dob, ''));
```

> **Lưu ý:** Constraint này chỉ thêm SAU KHI Phase 01 đã gộp xong duplicates.

### Step 2: Cập nhật `addPatient` action
- [x] File: `src/actions/patients.ts`

```typescript
// Thêm check: trước khi INSERT, kiểm tra xem patient đã tồn tại chưa
// Nếu đã có (cùng name_normalized + dob) → return existing patient
export async function addPatient(data: PatientFormData) {
  const supabase = await createClient();
  const nameNormalized = removeDiacritics(data.name);
  
  // Check existing patient
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('name_normalized', nameNormalized)
    .eq('dob', data.dob || '')
    .maybeSingle();
  
  if (existing) {
    // Patient already exists, update info and return
    await updatePatient(existing.id, data);
    return existing;
  }
  
  // New patient - insert as normal
  // ... existing insert logic
}
```

### Step 3: Verify `getPatientById` query
- [x] File: `src/actions/patients.ts` - function `getPatientById`

Sau Phase 01, query hiện tại đã đúng:
```typescript
const { data } = await supabase
  .from('patients')
  .select('*, prescriptions:prescriptions_header(...)')
  .eq('id', id)
  .single();
```
→ Giờ mỗi patient chỉ có 1 row, nhưng có NHIỀU prescriptions → ✅ Đúng

### Step 4: Verify `getMedicineUsageByPatient`
- [x] File: `src/actions/patients.ts` - function `getMedicineUsageByPatient`

Query hiện tại đã đúng (join qua prescriptions_header.patient_id).
Sau gộp, sẽ tự động trả về usage từ TẤT CẢ prescriptions → ✅ Đúng

### Step 5: Verify `searchPatients`
- [x] File: `src/actions/patients.ts` - function `searchPatients`

Sau gộp, search sẽ trả về 1 row per patient thay vì nhiều rows → ✅ Đúng

## Files to Create/Modify
- `supabase/migrations/005_unique_patient_constraint.sql` - Unique constraint
- `src/actions/patients.ts` - Cập nhật addPatient logic

## Test Criteria
- [x] `getPatientById(767)` → notFound (ID này đã bị gộp vào primary)
- [x] "Nguyễn Quang Tùng Lâm" primary ID → có 11+ prescriptions (Verified: 12)
- [x] `addPatient` với tên đã tồn tại → return existing patient (không tạo mới)
- [x] `getMedicineUsageByPatient` trả về tổng thuốc từ TẤT CẢ lượt khám
- [x] Search "tùng lâm" → chỉ 1 kết quả (Verified: 1 result)

## Notes
- Phase này chủ yếu là **verify** (vì Phase 01 đã fix data layer)
- Unique constraint quan trọng để NGĂN bug tái phát
- `addPatient` cần upsert logic để xử lý edge case

---
Next Phase: [phase-03-ui-adaptation.md](./phase-03-ui-adaptation.md)
