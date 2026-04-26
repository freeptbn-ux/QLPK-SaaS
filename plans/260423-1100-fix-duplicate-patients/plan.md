# Plan: Fix Duplicate Patients - Gộp lịch sử khám bệnh
Created: 2026-04-23T11:00:00+07:00
Status: 🟡 In Progress

## 🐛 Vấn đề

App Python cũ sử dụng kiến trúc **"1 lượt khám = 1 bản ghi patient"**. Khi migrate sang SaaS:
- **716 bản ghi patients** nhưng chỉ **216 người thật**
- **124 nhóm bị trùng** (624 bản ghi duplicate)
- Ví dụ: "Nguyễn Quang Tùng Lâm" có **11 bản ghi** với 11 chẩn đoán khác nhau

### Hậu quả:
- Mỗi "bản sao" patient chỉ thấy 1-2 đơn thuốc (thay vì toàn bộ lịch sử)
- Danh sách bệnh nhân hiển thị trùng lặp
- Thống kê bị sai (đếm 716 thay vì 216 bệnh nhân)

## 🔍 Nguyên nhân gốc

| Aspect | Legacy Python App | SaaS App |
|--------|-------------------|----------|
| Kiến trúc | 1 patient row = 1 lượt khám | 1 patient row = 1 người thật |
| Lịch sử | Query theo `name + dob` qua TẤT CẢ rows | Query theo `patient_id` (1 row duy nhất) |
| Function | `get_all_diagnoses_by_name_dob()` | `getPatientById()` + join prescriptions |

## Tech Stack
- Database: Supabase (PostgreSQL)
- Frontend: Next.js + MUI
- Migration: SQL + TypeScript server actions

## Phases

| Phase | Name | Status | Mô tả |
|-------|------|--------|--------|
| 01 | Database Consolidation | ⬜ Pending | SQL migration gộp duplicate patients |
| 02 | Query Logic Update | ⬜ Pending | Cập nhật server actions cho kiến trúc mới |
| 03 | UI Adaptation | ⬜ Pending | Cập nhật PatientList + PatientDetail |
| 04 | Verification & Cleanup | ⬜ Pending | Kiểm tra data + dọn dẹp |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
