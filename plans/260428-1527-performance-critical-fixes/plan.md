# Plan: Performance Critical Fixes
Created: 2026-04-28T15:27:00+07:00
Status: 🟡 In Progress

## Overview
Sửa 4 lỗi hiệu năng nghiêm trọng (Critical) được phát hiện từ báo cáo `performace.md` và `1.md`. Chỉ tập trung vào những thứ **BẮT BUỘC fix ngay** — ảnh hưởng trực tiếp tới tốc độ tải trang, độ mượt UI và tải database.

## Các vấn đề cần fix

| # | Vấn đề | Mức độ | Ảnh hưởng |
|---|--------|--------|-----------|
| 1 | Root Layout dùng `'use client'` | 🔴 Critical | Toàn bộ app bị ép thành Client Component, tải chậm |
| 2 | `searchPatients` dùng `count: 'exact'` | 🔴 Critical | Full table scan mỗi lần search, database nghẽn |
| 3 | StatisticsClient gọi 4 lần `setState` riêng lẻ | 🔴 Critical | 4 lần re-render liên tiếp, biểu đồ giật lag |
| 4 | Recharts animation 1500ms mỗi lần data thay đổi | 🟠 High | UI bị lock ~6 giây khi chuyển time range |

## Phases

| Phase | Name | Status | Files thay đổi |
|-------|------|--------|----------------|
| 01 | Tách Layout thành Server Component | ⬜ Pending | 3 files |
| 02 | Tối ưu Database Queries | ⬜ Pending | 1 file |
| 03 | Gộp State + Tối ưu Chart Animation | ⬜ Pending | 3 files |

## Quick Commands
- Bắt đầu Phase 1: `/code phase-01`
- Check progress: `/next`
