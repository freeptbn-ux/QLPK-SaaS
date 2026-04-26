# Phase 03: Frontend — Edit Dialog UI
Status: ✅ Completed
Dependencies: Phase 02 (Server Action phải sẵn sàng)

## Objective
Thêm nút **"Sửa đơn"** vào `PrescriptionHistory.tsx` và tạo **Edit Dialog** cho phép chỉnh sửa toàn bộ thông tin đơn thuốc (chẩn đoán, ghi chú, ngày, danh sách thuốc) với cảnh báo kho âm.

## Requirements
### Functional
- [ ] Nút "Sửa đơn" xuất hiện bên cạnh nút "Xóa đơn" trên MỌI đơn thuốc (không giới hạn ngày).
- [ ] Click → Mở Edit Dialog với data hiện tại đã được pre-fill.
- [ ] Có thể sửa: chẩn đoán, ghi chú, ngày kê đơn.
- [ ] Có thể sửa danh sách thuốc: thay đổi số lượng, xóa thuốc, thêm thuốc mới (MedicineAutocomplete).
- [ ] Hiển thị **tổng tiền thuốc** cập nhật realtime khi chỉnh sửa.
- [ ] Hiển thị **cảnh báo kho âm** nếu tăng số lượng / thêm thuốc mà kho không đủ.
- [ ] Loading state khi đang lưu.
- [ ] Cập nhật UI ngay lập tức sau khi lưu thành công (optimistic hoặc state update).

### Non-Functional
- [ ] Dialog style giống với Append Dialog và Delete Dialog hiện tại (consistency).
- [ ] Animation: framer-motion (giống dialogs hiện tại).
- [ ] Responsive: hoạt động trên mobile.

## Implementation Steps

### Step 1: Thêm icon import
File: `PrescriptionHistory.tsx`

```typescript
import { HiOutlinePencilSquare } from 'react-icons/hi2';
```

### Step 2: Thêm state cho Edit Dialog
```typescript
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [prescriptionToEdit, setPrescriptionToEdit] = useState<PrescriptionWithDetails | null>(null);

// Edit form state
const [editDiagnosis, setEditDiagnosis] = useState('');
const [editNotes, setEditNotes] = useState('');
const [editDate, setEditDate] = useState('');
const [editItems, setEditItems] = useState<PrescriptionItem[]>([]);
const [isEditing, setIsEditing] = useState(false);
const [editError, setEditError] = useState<string | null>(null);
const [stockWarnings, setStockWarnings] = useState<string[]>([]);
```

### Step 3: Handler mở Edit Dialog
```typescript
const handleOpenEdit = (prescription: PrescriptionWithDetails) => {
  setPrescriptionToEdit(prescription);
  setEditDiagnosis(prescription.diagnosis || '');
  setEditNotes(prescription.notes || '');
  setEditDate(dayjs(prescription.prescription_date).format('YYYY-MM-DD'));
  setEditItems(
    prescription.prescription_details.map(d => ({
      medicine_id: d.medicine_id,
      medicine_name: d.medicines?.name || '',
      packing_spec: d.medicines?.packing_spec || '',
      quantity: d.quantity,
      unit_price: d.unit_price || 0,
    }))
  );
  setEditError(null);
  setStockWarnings([]);
  setIsEditDialogOpen(true);
};
```

### Step 4: Handlers cho chỉnh sửa items trong dialog
```typescript
// Thêm thuốc mới vào edit form
const handleEditAddMedicine = (medicine: Medicine | null) => { ... };

// Xóa thuốc khỏi edit form
const handleEditRemoveItem = (medicineId: number) => { ... };

// Cập nhật số lượng thuốc
const handleEditUpdateQuantity = (medicineId: number, quantity: number) => { ... };
```

### Step 5: Handler kiểm tra stock warnings
```typescript
// Gọi getMedicineStockByIds trước khi submit
// So sánh: cần bao nhiêu vs có bao nhiêu trong kho + bù từ đơn cũ
const checkStockWarnings = async () => { ... };
```

### Step 6: Handler submit chỉnh sửa
```typescript
const handleEditSubmit = async () => {
  if (!prescriptionToEdit) return;
  if (!editDiagnosis.trim()) { setEditError('...'); return; }
  if (editItems.length === 0) { setEditError('...'); return; }

  setIsEditing(true);
  try {
    const result = await updatePrescription({
      prescription_id: prescriptionToEdit.id,
      patient_id: patientId,
      diagnosis: editDiagnosis,
      notes: editNotes,
      prescription_date: new Date(editDate).toISOString(),
      items: editItems,
    });
    
    if (result.success) {
      // Update local state
      setPrescriptions(prev => prev.map(p => 
        p.id === prescriptionToEdit.id 
          ? { ...p, /* updated fields */ }
          : p
      ));
      setIsEditDialogOpen(false);
    } else {
      setEditError(result.error || 'Lỗi khi cập nhật đơn thuốc');
    }
  } catch {
    setEditError('Lỗi kết nối máy chủ');
  } finally {
    setIsEditing(false);
  }
};
```

### Step 7: Thêm nút "Sửa đơn" vào action bar
Vị trí: bên cạnh nút "Xóa đơn", trước nút "In đơn thuốc" (dòng ~284-308 hiện tại).

```tsx
<button 
  onClick={() => handleOpenEdit(p)}
  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold 
    text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 
    rounded-xl transition-all active:scale-95"
>
  <HiOutlinePencilSquare className="w-4 h-4" />
  Sửa đơn
</button>
```

### Step 8: Xây dựng Edit Dialog JSX
Dialog bao gồm:
1. **Header**: "Sửa đơn thuốc #{id}"
2. **Form fields**:
   - Ngày kê đơn (`<input type="date">`)
   - Chẩn đoán (`<textarea>`)
   - Ghi chú (`<textarea>`)
3. **Danh sách thuốc** (table editable):
   - Tên thuốc | SL (input) | Đơn giá (readonly) | Thành tiền | Xóa
4. **Thêm thuốc** (`<MedicineAutocomplete>`)
5. **Tổng tiền** (realtime)
6. **Cảnh báo kho âm** (nếu có)
7. **Buttons**: Hủy | Lưu thay đổi

Style: Giống Append Dialog hiện tại, nhưng lớn hơn (`max-w-2xl`).

## UI Wireframe (Text)

```
┌──────────────────────────────────────────────┐
│  Sửa đơn thuốc #123                    [X]  │
├──────────────────────────────────────────────┤
│                                              │
│  Ngày kê đơn: [2026-04-20        ]          │
│                                              │
│  Chẩn đoán *:                                │
│  ┌────────────────────────────────────────┐  │
│  │ Viêm họng cấp                         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Thuốc trong đơn:                            │
│  ┌──────────────┬────┬──────┬──────┬───┐    │
│  │ Tên thuốc    │ SL │Đơn giá│Tiền  │ X │    │
│  ├──────────────┼────┼──────┼──────┼───┤    │
│  │ Paracetamol  │[10]│5,000 │50,000│ 🗑│    │
│  │ Amoxicillin  │[ 5]│8,000 │40,000│ 🗑│    │
│  └──────────────┴────┴──────┴──────┴───┘    │
│                                              │
│  [🔍 Nhập tên thuốc để thêm...          ]   │
│                                              │
│  ⚠️ Cảnh báo: Kho Paracetamol sẽ bị âm -3  │
│                                              │
│  Ghi chú:                                    │
│  ┌────────────────────────────────────────┐  │
│  │ Uống sau ăn                           │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Tổng tiền thuốc: 90,000 đ                  │
│                                              │
├──────────────────────────────────────────────┤
│                        [Hủy] [Lưu thay đổi] │
└──────────────────────────────────────────────┘
```

## Files to Create/Modify
- `src/components/features/patients/PrescriptionHistory.tsx` — **MODIFY**: 
  - Thêm nút "Sửa đơn"
  - Thêm Edit Dialog
  - Thêm state & handlers
- `src/actions/prescriptions.ts` — Import đã có từ Phase 02

## Test Criteria
- [ ] Nút "Sửa đơn" hiển thị trên tất cả đơn thuốc
- [ ] Click → Dialog mở với data pre-filled đúng
- [ ] Sửa số lượng → tổng tiền cập nhật realtime
- [ ] Xóa thuốc khỏi form → thuốc biến mất, tổng tiền cập nhật
- [ ] Thêm thuốc mới → xuất hiện trong bảng, tổng tiền cập nhật
- [ ] Cảnh báo kho âm hiển thị khi cần
- [ ] Submit → loading spinner → dialog đóng → UI cập nhật
- [ ] Submit lỗi → hiển thị error message, dialog giữ nguyên

## Notes
- Tái sử dụng `MedicineAutocomplete` component đã có.
- Không cần tạo component mới — thêm trực tiếp vào `PrescriptionHistory.tsx` (giống pattern của Append Dialog và Delete Dialog hiện tại).
- Nếu file quá dài sau khi thêm, có thể extract `EditPrescriptionDialog` thành component riêng trong lần refactor sau.

---
Previous Phase: [Phase 02: Backend](./phase-02-backend.md)
Next Phase: [Phase 04: Integration & Testing](./phase-04-integration.md)
