# Phase 04: Streaming với React Suspense

Status: ⬜ Pending  
Dependencies: Phase 02, Phase 03 (recommended)  
Effort: ~45 phút  
Fixes: 🔴 Thiếu Streaming — Trang render monolithic

---

## Objective

Tách trang `/patients/[id]` thành 2 phần stream độc lập:
1. **Patient Info** → render ngay (~0.2ms DB)
2. **Prescription History** → stream vào sau (~1ms DB)

---

## Task 1: Tách hàm data fetching

- [ ] **1.1** Tạo `getPatientBasicInfo(id)` trong `src/actions/patients.ts`
  - Chỉ query `patients` table (KHÔNG query prescriptions)
  - Bọc `cache()` để `generateMetadata` reuse
- [ ] **1.2** Giữ nguyên `getPatientById()` cho backward compatibility

## Task 2: Tạo Prescription Skeleton

- [ ] **2.1** Tạo `src/components/features/patients/PrescriptionSkeleton.tsx`
  - Skeleton header + 3-4 prescription cards + `animate-pulse`

## Task 3: Tạo async Server Component

- [ ] **3.1** Tạo `src/components/features/patients/PrescriptionSection.tsx`
  - Async Server Component (NOT client)
  - Fetch prescriptions → render `<PrescriptionHistory />`
  - Sẽ được wrap trong `<Suspense>`

## Task 4: Refactor page.tsx

- [ ] **4.1** `generateMetadata` → dùng `getPatientBasicInfo(id)`
- [ ] **4.2** Component chính → fetch basic info + wrap PrescriptionSection trong `<Suspense>`
- [ ] **4.3** Tách `PrescriptionHistory` ra khỏi `PatientDetail.tsx`
  - PatientDetail chỉ render thông tin cá nhân

## Task 5: Test

- [ ] **5.1** Patient info render ngay, prescriptions stream sau
- [ ] **5.2** Tất cả tính năng (edit, delete, kê đơn, sửa đơn) hoạt động
- [ ] **5.3** Pagination "Tải thêm" vẫn hoạt động
- [ ] **5.4** Không layout shift khi data arrive

---

## Files to Create/Modify

| File | Thao tác | Mục đích |
|------|----------|----------|
| `src/actions/patients.ts` | **Sửa** | Thêm `getPatientBasicInfo()` |
| `src/components/features/patients/PrescriptionSkeleton.tsx` | **Tạo** | Skeleton UI |
| `src/components/features/patients/PrescriptionSection.tsx` | **Tạo** | Async server component |
| `src/app/(dashboard)/patients/[id]/page.tsx` | **Sửa** | Suspense boundary |
| `src/components/features/patients/PatientDetail.tsx` | **Sửa** | Bỏ PrescriptionHistory |

---

## ⚠️ Lưu ý

1. **PatientDetail.tsx** là `'use client'` — khi tách PrescriptionHistory ra, props type sẽ đổi từ `PatientWithPrescriptions` → `Patient`
2. Kiểm tra xem có pages khác dùng `PatientDetail` với type cũ không
3. `PrescriptionSection` là server component, `PrescriptionHistory` vẫn là client component

---

Next Phase: → [Phase 05: Client Bundle Optimization](./phase-05-client-bundle.md)
