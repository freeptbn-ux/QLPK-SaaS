# Phase 02: Cập nhật bảng bệnh nhân (Ẩn cột + Format ngày sinh)

Status: ✅ Completed
Dependencies: Phase 01

## Objective

Chỉnh sửa component `PatientListClient.tsx` để:
1. Bỏ cột **"Giới tính"** và **"Địa chỉ"** ở Desktop table
2. Bỏ hiển thị giới tính ở Mobile cards
3. Dùng hàm `formatDob()` cho cột "Ngày sinh" thay vì raw value

## Implementation Steps

### A. Desktop Table (dòng 148-243)

1. [ ] Import `formatDob` từ `@/lib/utils/date`
2. [ ] **Xóa header "Giới tính"** — Xóa dòng 155:
   ```html
   <th className="px-6 py-5 font-bold tracking-tight">Giới tính</th>
   ```
3. [ ] **Xóa header "Địa chỉ"** — Xóa dòng 157:
   ```html
   <th className="px-6 py-5 font-bold tracking-tight">Địa chỉ</th>
   ```
4. [ ] **Xóa cell "Giới tính"** — Xóa dòng 191:
   ```html
   <td className="px-6 py-5 text-slate-600 dark:text-slate-400">{patient.gender}</td>
   ```
5. [ ] **Xóa cell "Địa chỉ"** — Xóa dòng 193-195:
   ```html
   <td className="px-6 py-5 truncate max-w-[200px]..." title={patient.address || ''}>
     {patient.address || 'N/A'}
   </td>
   ```
6. [ ] **Format Ngày sinh** — Thay đổi dòng 184 từ:
   ```tsx
   {patient.dob || 'N/A'}
   ```
   Thành:
   ```tsx
   {formatDob(patient.dob)}
   ```
7. [ ] **Cập nhật `colSpan`** — Dòng 165: Đổi `colSpan={8}` thành `colSpan={6}` (vì bớt 2 cột)

### B. Mobile Cards (dòng 246-294)

8. [ ] **Bỏ hiển thị giới tính** — Dòng 258, thay:
   ```tsx
   {patient.gender} • {patient.dob ? formatAge(patient.dob) : 'N/A'}
   ```
   Thành:
   ```tsx
   {patient.dob ? `${formatDob(patient.dob)} • ${formatAge(patient.dob)}` : 'N/A'}
   ```

## Bảng so sánh trước/sau

### Desktop Table

| Trước | Sau |
|-------|-----|
| STT \| Họ và tên \| Ngày sinh \| **Giới tính** \| SĐT \| **Địa chỉ** \| Khám gần nhất \| Thao tác | STT \| Họ và tên \| Ngày sinh \| SĐT \| Khám gần nhất \| Thao tác |
| Ngày sinh hiển thị: `1990-03-15` | Ngày sinh hiển thị: `15/03/1990` |
| 8 cột | 6 cột |

### Mobile Cards

| Trước | Sau |
|-------|-----|
| `Nam • 35 tuổi` | `15/03/1990 • 35 tuổi` |

## Files to Modify
- `src/components/features/patients/PatientListClient.tsx`

## Test Criteria
- [ ] Desktop: Bảng hiển thị đúng 6 cột (STT, Họ tên, Ngày sinh, SĐT, Khám gần nhất, Thao tác)
- [ ] Desktop: Cột "Giới tính" không còn xuất hiện
- [ ] Desktop: Cột "Địa chỉ" không còn xuất hiện
- [ ] Desktop: Ngày sinh hiển thị dạng DD/MM/YYYY (VD: `15/03/1990`)
- [ ] Desktop: Ngày sinh `null` hiển thị "N/A"
- [ ] Mobile: Card không hiển thị giới tính
- [ ] Mobile: Ngày sinh hiển thị dạng DD/MM/YYYY
- [ ] EmptyState vẫn hiển thị đúng (colSpan=6)
- [ ] Pagination vẫn hoạt động bình thường
- [ ] Không có lỗi TypeScript

## Notes
- Dữ liệu `gender` và `address` vẫn tồn tại trong database và Patient type — ta chỉ ẩn khỏi giao diện danh sách.
- Các trang khác (VD: Patient Detail, Patient Form) KHÔNG bị ảnh hưởng.

---
Next Phase: [phase-03-verify.md](./phase-03-verify.md)
