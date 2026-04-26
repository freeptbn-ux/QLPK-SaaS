# Phase 05: Prescription Module
Status: ✅ Completed
Dependencies: Phase 03 (Patient), Phase 04 (Medicine)

## Objective
Xây dựng module kê đơn thuốc: tạo đơn mới cho bệnh nhân, chọn thuốc từ kho, tính tiền tự động, trừ tồn kho khi kê đơn. Đây là module phức tạp nhất vì liên kết cả Patient + Medicine.

## Requirements

### Functional
- [x] Tạo đơn thuốc mới cho bệnh nhân (từ Patient Detail page)
- [x] Chọn thuốc từ danh sách (autocomplete search)
- [x] Nhập số lượng, hiện đơn giá, tính thành tiền
- [x] Thêm nhiều dòng thuốc vào 1 đơn
- [x] Tự động tính tổng tiền đơn thuốc
- [x] Phí khám cộng vào tổng (configurable)
- [x] Trừ tồn kho (stock) khi lưu đơn
- [x] Cập nhật chẩn đoán của bệnh nhân
- [x] Thêm thuốc vào đơn đã có (cùng ngày = append)
- [x] Xem chi tiết đơn thuốc đã kê

### Non-Functional
- [x] Transaction: tạo header + details + trừ stock trong 1 transaction
- [x] Autocomplete search thuốc debounce 300ms
- [x] Responsive layout cho mobile (form dọc)

## Implementation Steps

### A. Server Actions
1. [x] Tạo `src/actions/prescriptions.ts`:
   ```typescript
   'use server'
   export async function createPrescription(data: CreatePrescriptionData)
   // → Insert prescriptions_header + prescription_details + deduct stock + update patient diagnosis
   // → Sử dụng Supabase RPC hoặc sequential operations

   export async function appendToPrescription(prescriptionId: number, items: PrescriptionItem[])
   // → Thêm thuốc vào đơn đã có

   export async function getPrescriptionsByPatient(patientId: number)
   // → Join prescriptions_header + prescription_details + medicines

   export async function getLatestPrescriptionId(patientId: number)

   export async function getConsultationFee()
   // → Đọc từ settings table
   ```

2. [x] Tạo types trong `src/types/forms.ts`:
   ```typescript
   export interface PrescriptionItem {
     medicine_id: number;
     medicine_name: string;  // display only
     quantity: number;
     unit_price: number;
   }

   export interface CreatePrescriptionData {
     patient_id: number;
     diagnosis: string;
     items: PrescriptionItem[];
     notes?: string;
   }
   ```

### B. Supabase RPC Function (Transaction)
3. [x] Tạo `supabase/migrations/002_create_prescription_rpc.sql`:
   ```sql
   CREATE OR REPLACE FUNCTION create_prescription(
     p_patient_id BIGINT,
     p_diagnosis TEXT,
     p_items JSONB,
     p_notes TEXT DEFAULT ''
   ) RETURNS BIGINT AS $$
   DECLARE
     v_header_id BIGINT;
     v_total REAL := 0;
     v_item JSONB;
   BEGIN
     -- Insert header
     INSERT INTO prescriptions_header (patient_id, diagnosis, notes)
     VALUES (p_patient_id, p_diagnosis, p_notes)
     RETURNING id INTO v_header_id;

     -- Insert details + deduct stock
     FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
       INSERT INTO prescription_details (prescription_header_id, medicine_id, quantity, unit_price)
       VALUES (
         v_header_id,
         (v_item->>'medicine_id')::BIGINT,
         (v_item->>'quantity')::INTEGER,
         (v_item->>'unit_price')::REAL
       );

       v_total := v_total + (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::REAL;

       -- Deduct stock
       UPDATE medicines
       SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
       WHERE id = (v_item->>'medicine_id')::BIGINT;
     END LOOP;

     -- Update header total
     UPDATE prescriptions_header SET total_amount = v_total WHERE id = v_header_id;

     -- Update patient diagnosis
     UPDATE patients SET diagnosis = p_diagnosis WHERE id = p_patient_id;

     RETURN v_header_id;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```
   → Đảm bảo atomicity: tất cả operations trong 1 transaction

### C. Prescription Form
4. [x] Tạo `src/components/features/prescriptions/PrescriptionForm.tsx`:
   - Patient info header (tên, tuổi, cân nặng)
   - Chẩn đoán input (TextField)
   - Medicine autocomplete (MUI Autocomplete + search API)
   - Dynamic row list: Thuốc | Quy cách | SL | Đơn giá | Thành tiền | Xóa
   - "Thêm thuốc" button
   - Tổng tiền thuốc + Phí khám = Tổng cộng
   - "Lưu đơn" button

5. [x] Tạo `src/components/features/prescriptions/MedicineAutocomplete.tsx`:
   - MUI Autocomplete component
   - Search medicines by name
   - Hiện tên + quy cách + giá trong dropdown
   - Khi chọn → tự động fill đơn giá

6. [x] Tạo `src/components/features/prescriptions/PrescriptionItemRow.tsx`:
   - 1 dòng thuốc trong đơn
   - Fields: Medicine (autocomplete), Quantity (number input), Unit Price (auto-filled), Total (computed)
   - Remove button (icon delete)

### D. Prescription View (trong Patient Detail)
7. [x] Update `src/components/features/patients/PrescriptionHistory.tsx`:
   - Hiện danh sách đơn thuốc đầy đủ
   - Mỗi đơn: MUI Accordion
     - Summary: Ngày | Chẩn đoán | Tổng tiền
     - Details: Table chi tiết thuốc (tên, SL, giá, thành tiền)
   - "Kê đơn mới" button → mở PrescriptionForm
   - "Thêm thuốc" button trên đơn gần nhất (append mode)

### E. Create Prescription Page
8. [x] Tạo `src/app/(dashboard)/patients/[id]/prescribe/page.tsx`:
   - Lấy patient info
   - Lấy consultation fee từ settings
   - Render PrescriptionForm

### F. Update Legacy medical_history
9. [x] Trong `createPrescription` action, cập nhật `medical_history` field theo format cũ:
   ```
   Chẩn đoán
   1) Thuốc A x 10 Viên
   2) Thuốc B x 5 Ống
   ```
   → Đảm bảo backward compatibility nếu cần

## Files to Create/Modify
- `src/actions/prescriptions.ts`
- `src/types/forms.ts` (update)
- `supabase/migrations/002_create_prescription_rpc.sql`
- `src/app/(dashboard)/patients/[id]/prescribe/page.tsx`
- `src/components/features/prescriptions/PrescriptionForm.tsx`
- `src/components/features/prescriptions/MedicineAutocomplete.tsx`
- `src/components/features/prescriptions/PrescriptionItemRow.tsx`
- `src/components/features/patients/PrescriptionHistory.tsx` (update)

## Test Criteria
- [x] Tạo đơn thuốc mới → lưu thành công vào DB
- [x] Chi tiết đơn thuốc hiện đúng trong lịch sử
- [x] Tổng tiền tính đúng (sum qty * price)
- [x] Phí khám cộng đúng vào tổng
- [x] Stock giảm đúng sau khi kê đơn
- [x] Autocomplete search thuốc hoạt động
- [x] Thêm nhiều dòng thuốc vào 1 đơn
- [x] Xóa dòng thuốc khỏi đơn (trước khi lưu)
- [x] Append thuốc vào đơn đã có
- [x] Patient diagnosis cập nhật sau khi kê
- [x] mobile: form responsive, scrollable

## Notes
- **Transaction**: Dùng Supabase RPC function (PostgreSQL function) thay vì nhiều API calls riêng lẻ → đảm bảo atomicity
- **Phí khám**: Đọc từ `settings` table, configurable (Phase 07)
- **Stock có thể âm**: Cho phép stock < 0 (kê trước, nhập sau) - giống logic Python app hiện tại
- **Append mode**: Nếu bệnh nhân đã có đơn trong ngày → option thêm thuốc vào đơn đó thay vì tạo mới
- **medical_history**: Cập nhật field legacy để giữ compatibility, nhưng source of truth là prescriptions_header + prescription_details

---
Previous Phase: ← [phase-04-medicine.md](./phase-04-medicine.md)
Next Phase: → [phase-06-stats-dose.md](./phase-06-stats-dose.md)
