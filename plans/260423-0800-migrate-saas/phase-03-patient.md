# Phase 03: Patient Module
Status: ✅ Completed
Dependencies: Phase 02 (Auth & Layout)

## Objective
Xây dựng module quản lý bệnh nhân đầy đủ: danh sách, tìm kiếm, phân trang, thêm/sửa/xóa, xem chi tiết hồ sơ + lịch sử khám.

## Requirements

### Functional
- [x] Danh sách bệnh nhân với phân trang (50 records/page)
- [x] Tìm kiếm theo tên (tìm không dấu) hoặc số điện thoại
- [x] Thêm bệnh nhân mới (dialog form)
- [x] Sửa thông tin bệnh nhân
- [x] Xóa bệnh nhân (confirm dialog, cascade delete prescriptions)
- [x] Xem chi tiết hồ sơ bệnh nhân
- [x] Xem lịch sử đơn thuốc của bệnh nhân
- [x] Hiển thị số lượt khám (count prescriptions)
- [x] Sắp xếp theo ngày khám mới nhất

### Non-Functional
- [x] Search debounce 300ms
- [x] Loading skeleton khi fetch data
- [x] Responsive table (MUI DataGrid hoặc Card list trên mobile)
- [x] Optimistic UI updates

## Implementation Steps

### A. Server Actions (Data Layer)
1. [x] Tạo `src/actions/patients.ts`:
   ```typescript
   'use server'
   export async function getPatientsPaginated(page: number, pageSize: number)
   export async function searchPatients(term: string, page: number, pageSize: number)
   export async function getPatientById(id: number)
   export async function addPatient(data: PatientFormData)
   export async function updatePatient(id: number, data: PatientFormData)
   export async function deletePatient(id: number)
   export async function getTotalPatientCount()
   ```

2. [x] Tạo `src/types/forms.ts`:
   ```typescript
   export interface PatientFormData {
     name: string;
     dob: string;
     gender: string;
     address: string;
     phone: string;
     weight: string;
     diagnosis: string;
   }
   ```

3. [x] Tạo `src/lib/utils/normalize.ts`:
   - Hàm `removeDiacritics(str)` - bỏ dấu tiếng Việt cho search
   - Port từ Python `utils.py` → TypeScript

### B. Validation (Zod Schemas)
4. [x] Tạo `src/lib/validations/patient.ts`:
   ```typescript
   export const patientSchema = z.object({
     name: z.string().min(1, 'Tên bệnh nhân không được để trống'),
     dob: z.string().optional(),
     gender: z.enum(['Nam', 'Nữ', '']).optional(),
     address: z.string().optional(),
     phone: z.string().optional(),
     weight: z.string().optional(),
     diagnosis: z.string().optional(),
   })
   ```

### C. Patient List Page
5. [x] Tạo `src/app/(dashboard)/patients/page.tsx`:
   - Server Component: fetch initial data
   - Pass data xuống Client Component

6. [x] Tạo `src/components/features/patients/PatientList.tsx`:
   - MUI Table / DataGrid hiển thị danh sách
   - Columns: STT, Ngày khám, Tên, Tuổi/DOB, Giới tính, SĐT, Địa chỉ, Cân nặng, Chẩn đoán
   - Pagination controls (MUI TablePagination)
   - Search bar (MUI TextField + Search icon)
   - "Thêm bệnh nhân" button

7. [x] Tạo `src/components/features/patients/PatientSearch.tsx`:
   - MUI TextField with search icon
   - Debounce 300ms
   - Search by name (không dấu) hoặc phone
   - Clear button

8. [x] Tạo `src/hooks/useDebounce.ts`:
   - Generic debounce hook cho search

### D. Add/Edit Patient Dialog
9. [x] Tạo `src/components/features/patients/PatientFormDialog.tsx`:
   - MUI Dialog với form fields:
     - Tên (required)
     - Ngày sinh (text field - giữ format tự do)
     - Giới tính (Radio: Nam/Nữ)
     - Địa chỉ
     - Số điện thoại
     - Cân nặng
     - Chẩn đoán
   - Validation với Zod
   - Submit qua Server Action
   - Loading state
   - Đóng dialog + refresh list sau khi save

### E. Patient Detail
10. [x] Tạo `src/app/(dashboard)/patients/[id]/page.tsx`:
    - Server Component: fetch patient + prescriptions
    - Hiển thị thông tin bệnh nhân
    - Danh sách lịch sử đơn thuốc

11. [x] Tạo `src/components/features/patients/PatientDetail.tsx`:
    - MUI Card hiện thông tin chi tiết
    - Edit button → mở PatientFormDialog
    - Delete button → confirm dialog
    - Back button → quay về list

12. [x] Tạo `src/components/features/patients/PrescriptionHistory.tsx`:
    - Danh sách đơn thuốc theo ngày giảm dần
    - Mỗi đơn hiện: ngày, chẩn đoán, tổng tiền
    - Expand để xem chi tiết thuốc (Accordion)

### F. Delete Confirmation
13. [x] Tạo `src/components/ui/ConfirmDialog.tsx`:
    - MUI Dialog xác nhận xóa (reusable)
    - Title, message, cancel/confirm buttons
    - Destructive action style (red confirm button)

### G. Helper Components
14. [x] Tạo `src/components/ui/PageHeader.tsx`:
    - Title + action buttons (reusable cho tất cả pages)
15. [x] Tạo `src/components/ui/EmptyState.tsx`:
    - Hiện khi không có data
16. [x] Tạo `src/components/ui/LoadingSkeleton.tsx`:
    - MUI Skeleton cho table rows

## Files to Create/Modify
- `src/actions/patients.ts`
- `src/types/forms.ts`
- `src/lib/utils/normalize.ts`
- `src/lib/validations/patient.ts`
- `src/hooks/useDebounce.ts`
- `src/app/(dashboard)/patients/page.tsx`
- `src/app/(dashboard)/patients/[id]/page.tsx`
- `src/components/features/patients/PatientList.tsx`
- `src/components/features/patients/PatientSearch.tsx`
- `src/components/features/patients/PatientFormDialog.tsx`
- `src/components/features/patients/PatientDetail.tsx`
- `src/components/features/patients/PrescriptionHistory.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/components/ui/PageHeader.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/LoadingSkeleton.tsx`

## Test Criteria
- [x] Danh sách bệnh nhân load đúng 50 records/page
- [x] Phân trang next/prev hoạt động
- [x] Search tìm được theo tên không dấu
- [x] Search tìm được theo số điện thoại
- [x] Thêm bệnh nhân → xuất hiện trong list
- [x] Sửa bệnh nhân → thông tin cập nhật
- [x] Xóa bệnh nhân → biến mất khỏi list + xóa đơn thuốc liên quan
- [x] Chi tiết bệnh nhân hiện đúng thông tin
- [x] Lịch sử đơn thuốc hiện đúng
- [x] Mobile: table chuyển sang card layout
- [x] Empty state hiện khi không có data

## Notes
- `name_normalized` được tính phía server khi add/update (hàm `removeDiacritics`)
- DOB giữ dạng TEXT (không parse date) vì data cũ có format "13 tháng", "6 tuổi"
- Search dùng `ilike` trên Supabase (PostgreSQL): `name_normalized.ilike.%${term}%`
- Pagination dùng Supabase `.range(from, to)` thay vì OFFSET
- Delete cascade: Supabase FK đã set `ON DELETE CASCADE` cho prescriptions

---
Previous Phase: ← [phase-02-auth-layout.md](./phase-02-auth-layout.md)
Next Phase: → [phase-04-medicine.md](./phase-04-medicine.md)
