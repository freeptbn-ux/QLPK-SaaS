# Plan: Fix Test Script Schema Mismatches
Created: 2026-04-26 18:34:00
Status: 🟡 In Progress

## Overview
Kế hoạch này nhằm sửa các lỗi xảy ra khi chạy script test `scripts/test-update-prescription.ts`. Hiện tại, script đang không chạy được do truyền sai dữ liệu so với schema thực tế của cơ sở dữ liệu Supabase (thiếu trường `dob` bắt buộc trong bảng `patients` và truyền thừa trường `unit` không tồn tại trong bảng `medicines`).

## Tech Stack
- Typescript (Test Script)
- Supabase (Database Schema)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Cập nhật Test Script | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
