# Plan: Hiển thị tuổi bệnh nhân thông minh (Smart Age Display)
Created: 2026-04-23T13:19
Status: 🟡 In Progress

## Overview
Tạo utility function `formatAge(dob)` để hiển thị tuổi bệnh nhân theo quy tắc lâm sàng nhi khoa:

| Khoảng tuổi | Hiển thị | Ví dụ |
|---|---|---|
| < 7 ngày | Theo ngày | `3 ngày tuổi` |
| 7 ngày → < 2 tháng | Theo tuần | `5 tuần tuổi` |
| 2 tháng → < 6 tuổi | Theo tháng | `18 tháng tuổi` |
| ≥ 6 tuổi | Theo năm | `8 tuổi` |

Sau đó tích hợp vào **tất cả** các nơi hiển thị DOB/tuổi trong app.

## Tech Stack
- Utility: TypeScript pure function (không dependency mới)
- Date: `dayjs` (đã có trong project)
- Test: Jest (đã có)

## Các nơi cần thay đổi

| # | File | Hiện tại | Sau khi sửa |
|---|---|---|---|
| 1 | `PatientList.tsx` (desktop) | Hiện raw DOB (`01/03/2026`) | DOB + `(7 tuần tuổi)` |
| 2 | `PatientList.tsx` (mobile) | `Nữ • 01/03/2026` | `Nữ • 7 tuần tuổi` |
| 3 | `PatientDetail.tsx` | Hiện raw DOB | DOB + tuổi tính toán |
| 4 | `PrescriptionForm.tsx` | `new Date().getFullYear() - ...` (sai) | Dùng `formatAge()` |
| 5 | `AgeGroupChart.tsx` | Logic tính tuổi inline | Dùng shared utility |

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Utility Function `formatAge` | ⬜ Pending | 0% |
| 02 | Tích hợp vào UI Components | ⬜ Pending | 0% |
| 03 | Cập nhật AgeGroupChart | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
