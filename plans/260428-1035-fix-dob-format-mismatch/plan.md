# Plan: Fix DOB Format Mismatch ("Không rõ tuổi")

Created: 2026-04-28T10:35
Status: ✅ Complete
Bug Report: [ngaythang.md](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main1/ngaythang.md)

## Overview

DB lưu `dob` dạng `YYYY-MM-DD` (do `patientFormSchema.transform()`), nhưng `parseDob()` trong `age.ts` chỉ chấp nhận `DD/MM/YYYY`. Kết quả: tất cả bệnh nhân hiển thị "Không rõ tuổi" hoặc tuổi trống.

**Hướng sửa:** Hướng A — Sửa `parseDob()` để hiểu cả `YYYY-MM-DD` lẫn `DD/MM/YYYY`.

## Phạm vi ảnh hưởng

| Component | File | Vấn đề |
|-----------|------|--------|
| `parseDob()` | `src/lib/utils/age.ts` | Chỉ parse `DD/MM/YYYY`, cần thêm `YYYY-MM-DD` |
| `PatientFormDialog` | `src/components/features/patients/PatientFormDialog.tsx` | Coi `YYYY-MM-DD` là "format cũ" → xóa trắng dob khi edit |
| `PatientDetail` | `src/components/features/patients/PatientDetail.tsx` | Hiện raw `YYYY-MM-DD` thay vì `DD/MM/YYYY` |
| `PatientList` | `src/components/features/patients/PatientList.tsx` | `formatAge()` trả `''` |
| `PatientListClient` | `src/components/features/patients/PatientListClient.tsx` | `formatAge()` trả `''` |
| `PrescriptionForm` | `src/components/features/prescriptions/PrescriptionForm.tsx` | Hiện "Không rõ tuổi" |
| `AgeGroupChart` | `src/components/features/statistics/AgeGroupChart.tsx` | `parseAgeParts()` trả `null` → skip tất cả |
| Unit tests | `src/lib/utils/__tests__/age.test.ts` | Không có test case cho `YYYY-MM-DD` |

## Phases

| Phase | Name | Status | Files |
|-------|------|--------|-------|
| 01 | Core Fix: `parseDob()` + Unit Tests | ✅ Complete | `age.ts`, `age.test.ts` |
| 02 | Fix Form Dialog + Display Format | ✅ Complete | `PatientFormDialog.tsx`, `PatientDetail.tsx` |
| 03 | Verify & Regression Test | ✅ Complete | Manual verify + existing tests |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
