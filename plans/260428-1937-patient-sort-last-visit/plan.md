# Plan: Sắp xếp bệnh nhân theo lượt khám gần nhất + Hiển thị ngày khám cuối

Created: 2026-04-28T19:37:00+07:00
Status: 🟡 In Progress

## Overview

Thay đổi trang `/patients` để:
1. **Sắp xếp** danh sách bệnh nhân theo ngày khám gần nhất (ai khám gần đây nhất → hiện trên cùng)
2. **Thêm cột** "Khám gần nhất" hiển thị ngày khám cuối cùng của từng bệnh nhân
3. Bệnh nhân chưa có lượt khám nào sẽ hiển thị ở cuối danh sách

## Phân tích hiện trạng

| Thành phần | File | Vấn đề hiện tại |
|---|---|---|
| Server action | `src/actions/patients.ts` | Sắp xếp theo `id DESC`, không join `prescriptions_header` |
| TypeScript type | `src/types/database.ts` | `Patient` interface không có `last_visit_date` |
| UI component | `src/components/features/patients/PatientListClient.tsx` | Không có cột "Khám gần nhất" |
| Page | `src/app/(dashboard)/patients/page.tsx` | Gọi `getPatientsPaginated` / `searchPatients` |

## Giải pháp kỹ thuật

Tạo **SQL function** (RPC) trên Supabase vì:
- Supabase JS client không hỗ trợ LEFT JOIN + subquery trực tiếp
- SQL function cho phép tối ưu query (1 round-trip thay vì N+1)
- `COUNT(*) OVER()` cho phép trả về total count trong cùng query

## Tech Stack
- Database: Supabase PostgreSQL (RPC function)
- Backend: Next.js Server Actions
- Frontend: React (client component)

## Phases

| Phase | Name | Status | Mô tả |
|-------|------|--------|--------|
| 01 | Database Function | ⬜ Pending | Tạo SQL function `get_patients_with_last_visit` |
| 02 | Backend Update | ⬜ Pending | Cập nhật server actions + TypeScript types |
| 03 | Frontend Update | ⬜ Pending | Thêm cột UI + cập nhật mobile cards |

**Tổng:** 3 phases | ~12 tasks | Ước tính: 1 session

## Quick Commands
- Bắt đầu: `/code phase-01`
- Kiểm tra: `/next`
