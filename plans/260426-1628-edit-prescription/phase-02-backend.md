# Phase 02: Backend — Server Action + Validation
Status: ✅ Completed
Dependencies: Phase 01 (RPC phải tồn tại trong DB)

## Objective
Tạo Server Action `updatePrescription` và Zod validation schema để frontend có thể gọi API sửa đơn thuốc an toàn.

## Requirements
### Functional
- [x] Server Action nhận dữ liệu đã validate, gọi RPC `update_prescription`.
- [x] Validate input: prescription_id, diagnosis (required), items (≥1), notes, prescription_date.
- [x] Trả về `{ success: boolean, error?: string }`.
- [x] Revalidate cache sau khi sửa thành công.

### Non-Functional
- [x] Zod validation chặt — whitelist tất cả fields.
- [x] Không tin tưởng bất kỳ data nào từ client.

## Implementation Steps

### Step 1: Thêm Zod schema cho update
File: `src/lib/validations/prescription.ts`

```typescript
// Thêm vào cuối file hiện tại:

export const updatePrescriptionSchema = z.object({
  prescription_id: z.number().int().positive(),
  patient_id: z.number().int().positive(),
  diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán'),
  items: z.array(prescriptionItemSchema).min(1, 'Cần ít nhất 1 loại thuốc'),
  notes: z.string().optional().default(''),
  prescription_date: z.string().min(1, 'Vui lòng chọn ngày kê đơn'),
});

export type ValidatedUpdatePrescriptionData = z.infer<typeof updatePrescriptionSchema>;
```

### Step 2: Tạo TypeScript interface
File: `src/types/forms.ts`

```typescript
// Thêm vào cuối file hiện tại:

export interface UpdatePrescriptionData {
  prescription_id: number;
  patient_id: number;
  diagnosis: string;
  items: PrescriptionItem[];
  notes?: string;
  prescription_date: string;
}
```

### Step 3: Tạo Server Action `updatePrescription`
File: `src/actions/prescriptions.ts`

```typescript
// Thêm vào cuối file hiện tại:

export async function updatePrescription(rawData: UpdatePrescriptionData) {
  const supabase = await createClient();

  // Validate
  const validation = updatePrescriptionSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: formatZodError(validation.error) };
  }
  const data = validation.data;

  // Sanitize monetary values
  const sanitizedItems = data.items.map(item => ({
    ...item,
    unit_price: Math.round(item.unit_price)
  }));

  const { error } = await supabase.rpc('update_prescription', {
    p_prescription_id: data.prescription_id,
    p_diagnosis: data.diagnosis,
    p_notes: data.notes || '',
    p_prescription_date: data.prescription_date,
    p_items: sanitizedItems,
  });

  if (error) {
    console.error('Error updating prescription:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/patients/${data.patient_id}`);
  return { success: true };
}
```

### Step 4: Tạo Server Action `getMedicineStock`
File: `src/actions/medicines.ts`

Cần thêm function để frontend kiểm tra stock trước khi submit (để hiển thị cảnh báo kho âm):

```typescript
export async function getMedicineStockByIds(ids: number[]) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, stock_quantity')
    .in('id', ids);

  if (error) return [];
  return data;
}
```

### Step 5: Import types mới
Cập nhật imports trong `prescriptions.ts`:
- Import `UpdatePrescriptionData` từ `@/types/forms`
- Import `updatePrescriptionSchema` từ `@/lib/validations/prescription`

## Files to Create/Modify
- `src/lib/validations/prescription.ts` — **MODIFY**: Thêm `updatePrescriptionSchema`
- `src/types/forms.ts` — **MODIFY**: Thêm `UpdatePrescriptionData` interface
- `src/actions/prescriptions.ts` — **MODIFY**: Thêm `updatePrescription` Server Action
- `src/actions/medicines.ts` — **MODIFY**: Thêm `getMedicineStockByIds` (nếu chưa có)

## Test Criteria
- [x] Gọi `updatePrescription` với data hợp lệ → trả về `{ success: true }`
- [x] Gọi với diagnosis rỗng → trả về validation error
- [x] Gọi với items rỗng → trả về validation error
- [x] Gọi với prescription_id không tồn tại → trả về DB error
- [x] Cache được revalidate sau khi update thành công

## Notes
- `prescription_date` nhận dạng ISO string từ client, RPC sẽ parse thành `TIMESTAMPTZ`.
- `consultation_fee` KHÔNG có trong input — giữ nguyên giá trị cũ trong DB.
- Có thể tái sử dụng `prescriptionItemSchema` đã có cho validation items.

---
Previous Phase: [Phase 01: Database](./phase-01-database.md)
Next Phase: [Phase 03: Frontend — Edit Dialog UI](./phase-03-frontend.md)
