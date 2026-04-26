# Phase 04: Medicine & Stock Module
Status: ✅ Completed
Dependencies: Phase 03 (Patient Module - reusable components)

## Objective
Xây dựng module quản lý kho thuốc: danh sách thuốc, thêm/sửa/xóa, quản lý tồn kho, cảnh báo thuốc sắp hết.

## Requirements

### Functional
- [x] Danh sách thuốc (tên, quy cách, giá, tồn kho, ngưỡng cảnh báo)
- [x] Tìm kiếm thuốc theo tên
- [x] Thêm/Sửa/Xóa thuốc
- [x] Cập nhật tồn kho (nhập thêm / điều chỉnh)
- [x] Cảnh báo thuốc sắp hết (stock ≤ min_stock_level) - badge/highlight
- [x] Không cho xóa thuốc đang có trong đơn thuốc

### Non-Functional
- [x] Sắp xếp theo tên (A-Z, case insensitive)
- [x] Low stock items highlighted (màu đỏ/cam)
- [x] Responsive card layout trên mobile

## Implementation Steps

### A. Server Actions
1. [x] Tạo `src/actions/medicines.ts`:
   ```typescript
   'use server'
   export async function getAllMedicines()
   export async function addMedicine(data: MedicineFormData)
   export async function updateMedicine(id: number, data: MedicineFormData)
   export async function deleteMedicine(id: number)
   export async function updateMedicineStock(id: number, newQuantity: number)
   export async function getLowStockMedicines()
   export async function isMedicineInUse(id: number): Promise<boolean>
   ```

### B. Validation
2. [x] Tạo `src/lib/validations/medicine.ts`:
   ```typescript
   export const medicineSchema = z.object({
     name: z.string().min(1, 'Tên thuốc không được để trống'),
     packing_spec: z.string().optional(),
     price: z.coerce.number().min(0, 'Giá phải ≥ 0'),
     stock_quantity: z.coerce.number().int().min(0).default(0),
     min_stock_level: z.coerce.number().int().min(0).default(5),
   })
   ```

### C. Medicine List Page
3. [x] Tạo `src/app/(dashboard)/medicines/page.tsx`:
   - Server Component fetch all medicines
   - Truyền data xuống MedicineList

4. [x] Tạo `src/components/features/medicines/MedicineList.tsx`:
   - MUI Table với columns: Tên, Quy cách, Giá, Tồn kho, Ngưỡng, Actions
   - Search filter (client-side, vì medicine list thường < 500 items)
   - Low stock badge: chip đỏ khi stock ≤ min_stock_level
   - Sort by name (default)
   - Toolbar: Search + "Thêm thuốc" button + "Thuốc sắp hết" filter toggle

### D. Add/Edit Medicine Dialog
5. [x] Tạo `src/components/features/medicines/MedicineFormDialog.tsx`:
   - MUI Dialog với form:
     - Tên thuốc (required, unique)
     - Quy cách đóng gói
     - Đơn giá
     - Số lượng tồn kho
     - Ngưỡng cảnh báo hết
   - Validation với Zod
   - Error handling cho unique constraint (tên thuốc trùng)

### E. Stock Management
6. [x] Tạo `src/components/features/medicines/StockAdjustDialog.tsx`:
   - Dialog nhanh để nhập thêm stock
   - Input: số lượng nhập thêm (hoặc điều chỉnh trực tiếp)
   - Hiện stock hiện tại → stock mới
   - Submit → update stock trên Supabase

### F. Low Stock Alert
7. [x] Tạo `src/components/features/medicines/LowStockAlert.tsx`:
   - MUI Alert/Banner ở đầu page
   - Hiện số lượng thuốc sắp hết
   - Click để filter chỉ hiện low stock items
   - Ẩn nếu không có thuốc sắp hết

### G. Delete Protection
8. [x] Xử lý trong `deleteMedicine` action:
   - Check `prescription_details` có record nào reference medicine_id không
   - Nếu có → return error "Thuốc đang được sử dụng trong đơn thuốc"
   - Nếu không → cho phép xóa

## Files to Create/Modify
- `src/actions/medicines.ts`
- `src/lib/validations/medicine.ts`
- `src/app/(dashboard)/medicines/page.tsx`
- `src/components/features/medicines/MedicineList.tsx`
- `src/components/features/medicines/MedicineFormDialog.tsx`
- `src/components/features/medicines/StockAdjustDialog.tsx`
- `src/components/features/medicines/LowStockAlert.tsx`

## Test Criteria
- [x] Danh sách thuốc hiện đúng tất cả medicines
- [x] Tìm kiếm thuốc theo tên hoạt động
- [x] Thêm thuốc mới → xuất hiện trong list
- [x] Sửa thuốc → thông tin cập nhật
- [x] Xóa thuốc không có trong đơn → xóa thành công
- [x] Xóa thuốc đang dùng → hiện error message
- [x] Cập nhật stock → số lượng thay đổi đúng
- [x] Thuốc có stock ≤ min_stock_level → hiện badge đỏ
- [x] Low stock alert hiện khi có thuốc sắp hết
- [x] Trùng tên thuốc → hiện error (unique constraint)

## Notes
- Medicines list thường < 500 items → search/sort phía client OK, không cần server pagination
- Stock được quản lý trực tiếp trên Supabase (khác với Python app chỉ lưu local)
- Khi kê đơn (Phase 05), stock sẽ tự động trừ
- Price dùng đơn vị VNĐ (nghìn đồng), format hiển thị: `{price}k` hoặc `{price * 1000} đ`

---
Previous Phase: ← [phase-03-patient.md](./phase-03-patient.md)
Next Phase: → [phase-05-prescription.md](./phase-05-prescription.md)
