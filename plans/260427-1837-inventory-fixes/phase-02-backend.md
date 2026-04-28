# Phase 02: Backend Actions
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Cập nhật Server Action để sử dụng hàm RPC mới, đồng thời bổ sung logic validation (Zod) trước khi xử lý, tránh việc truyền số liệu sai hoặc lỗ hổng từ phía console/API trực tiếp.

## Requirements
### Functional
- [x] Bổ sung Schema Zod cho quá trình điều chỉnh tồn kho (VD: `stockAdjustmentSchema`).
- [x] Sửa đổi hàm `updateMedicineStock` trong `src/actions/medicines.ts` để gọi hàm RPC `adjust_medicine_stock` thay vì câu lệnh `.update()` thông thường.
- [x] Thống nhất quy định tồn âm trong file `src/lib/validations/medicine.ts` (loại bỏ `// Cho phép âm theo business rule` nếu đổi logic).

### Non-Functional
- [x] Security: Server-side validation đảm bảo số liệu gửi lên là an toàn.
- [x] Error Handling: Bắt và phản hồi lỗi khi quá trình cập nhật qua RPC thất bại (ví dụ: kho bị âm nếu có trigger chặn lại).

## Implementation Steps
1. [x] Thêm schema vào `src/lib/validations/medicine.ts`:
   ```typescript
   export const stockAdjustmentSchema = z.object({
     id: z.number(),
     adjustment: z.number(),
     reason: z.string().optional()
   });
   ```
2. [x] Sửa hàm `updateMedicineStock` trong `src/actions/medicines.ts` nhận tham số `id`, `adjustment` (thay vì `newQuantity`) và `reason`.
3. [x] Gọi supabase rpc: `supabase.rpc('adjust_medicine_stock', { p_medicine_id: id, p_adjustment: adjustment, p_reason: reason })`.

## Files to Create/Modify
- `src/lib/validations/medicine.ts`
- `src/actions/medicines.ts`

---
Next Phase: [Phase 03: Frontend Fixes](./phase-03-frontend.md)
