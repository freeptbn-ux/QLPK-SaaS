# Plan: Thay thế tên "QLPK SaaS" bằng "Tên phòng khám" (Dynamic Clinic Name)
Created: 2026-04-28 23:38
Status: 🟡 In Progress

## Overview
Hiện tại, tên "QLPK SaaS" đang được hardcode trong các component như `Sidebar`, `TopBar` và thẻ `title` (metadata) của một số trang.
Mục tiêu của plan này là lấy `clinic_name` từ Cài đặt (bảng `settings` trong Supabase) và hiển thị động tên phòng khám trên toàn bộ ứng dụng.

## Tech Stack
- Frontend: React Context, Next.js Metadata (generateMetadata)
- Backend: Supabase (settings table)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Cài đặt Settings Context & Layout Provider | ⬜ Pending | 0% |
| 02 | Cập nhật UI Components & Metadata | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
