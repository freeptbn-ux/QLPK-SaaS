# Plan: Nâng cấp Input Ngày Sinh (DD/MM/YYYY Auto-Jump)

Created: 2026-04-23 12:27
Status: 🟡 In Progress

## Overview

Thay thế trường nhập "Ngày sinh / Tuổi" dạng text tự do bằng input có format cố định **DD/MM/YYYY**:
- Chỉ cho phép nhập số
- Tự động nhảy cursor: DD → MM → YYYY
- Tự động thêm dấu `/` phân cách
- Validate ngày hợp lệ (không cho nhập 32/13/2025...)

## Hiện trạng

| File | Vấn đề |
|------|--------|
| `PatientFormDialog.tsx` L128-140 | Trường `dob` là TextField thuần, nhập gì cũng được |
| `patient.ts` (validation) L5 | `dob: z.string().optional()` — không validate format |
| `patients.ts` (action) L73-109 | `addPatient` dùng `dob` để match trùng lặp — cần format nhất quán |

## Ảnh hưởng đến dữ liệu cũ

> ⚠️ Database hiện có ~700+ bệnh nhân với `dob` ở nhiều format khác nhau (năm sinh `1990`, tháng `12 tháng`, ngày đầy đủ `05/03/1992`...). Cần migration script để chuẩn hóa data cũ.

## Tech Stack

- Component: React + MUI TextField
- Validation: Zod
- Không cần thêm thư viện mới

## Phases

| Phase | Name | Status | Mô tả |
|-------|------|--------|--------|
| 01 | DateInput Component | ⬜ Pending | Tạo component `DateInput` với auto-jump |
| 02 | Tích hợp & Validation | ⬜ Pending | Gắn vào form, cập nhật Zod schema |
| 03 | Migration Data & Kiểm thử | ⬜ Pending | Chuẩn hóa dữ liệu cũ + test end-to-end |

## Quick Commands

- Bắt đầu Phase 1: `/code phase-01`
- Kiểm tra tiến độ: `/next`
