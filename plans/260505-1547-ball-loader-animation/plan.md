# Plan: 4-Ball Rotating Loader Animation
Created: 2026-05-05T15:47:00+07:00
Status: 🟡 In Progress

## Overview
Thay thế toàn bộ hệ thống loading hiện tại (Skeleton/Spinner) bằng một hiệu ứng đồng nhất: 4 quả bóng màu sắc xoay tròn kèm chữ "Đang tải". Đồng thời tích hợp cơ chế bắt sự kiện click link toàn cục để hiển thị loading ngay lập tức khi người dùng điều hướng.

## Tech Stack
- Frontend: Next.js 16 (App Router)
- Animation: CSS Keyframes + Framer Motion
- Navigation Detection: Client Hooks (usePathname, useSearchParams)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Thiết kế component BallLoader | ⬜ Pending | 0% |
| 02 | Tích hợp Global Navigation Loader | ⬜ Pending | 0% |
| 03 | Thay thế hệ thống Skeleton & Loading mặc định | ⬜ Pending | 0% |
| 04 | Kiểm thử & Tinh chỉnh | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
