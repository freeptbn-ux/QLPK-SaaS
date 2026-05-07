# Plan: Tối ưu Tốc độ Trang Chi tiết Bệnh nhân

Created: 2026-05-07  
Status: 🟡 In Progress  
Source: `load.md` + `load2.md` → `load_final.md`

## Overview

Fix 7 vấn đề performance được phát hiện trên trang `/patients/[id]`, chia thành 5 phases theo thứ tự dependency + impact/effort ratio.

## Tech Stack hiện tại

- Framework: Next.js (App Router, Server Components)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (JWT)
- UI: React + TailwindCSS + framer-motion

## Sơ đồ dependency giữa các phases

```
Phase 1 (DB + Loading UI)     ← Không phụ thuộc gì, chạy độc lập
         ↓
Phase 2 (Middleware + Auth)   ← Nền tảng cho auth optimization
         ↓
Phase 3 (Dashboard Layout)    ← Cần middleware từ Phase 2
         ↓
Phase 4 (Streaming/Suspense)  ← Cần auth ổn định từ Phase 2-3
         ↓
Phase 5 (Client Bundle)       ← Cần Suspense structure từ Phase 4
```

## Phases

| Phase | Name | Mức độ | Effort | Status | Progress |
|-------|------|--------|--------|--------|----------|
| 01 | Quick Wins: DB Index + Loading UI | 🟢 Nhẹ + 🟡 Vừa | ~15 phút | ⬜ Pending | 0% |
| 02 | Middleware + Auth Optimization | 🔴 Nặng + 🟡 Vừa | ~45 phút | ⬜ Pending | 0% |
| 03 | Dashboard Layout Non-blocking | 🔴 Nặng | ~30 phút | ⬜ Pending | 0% |
| 04 | Streaming với Suspense | 🔴 Nặng | ~45 phút | ⬜ Pending | 0% |
| 05 | Client Bundle Optimization | 🟡 Vừa | ~20 phút | ⬜ Pending | 0% |

**Tổng:** 18 tasks | Ước tính: ~2.5 giờ

## Các lỗi được map vào phases

| Lỗi | Mức độ | Phase |
|------|--------|-------|
| Thiếu Composite Index | 🟡 Vừa | Phase 1 |
| Loading UI sai ngữ cảnh | 🟢 Nhẹ | Phase 1 |
| Không có middleware.ts | 🟡 Vừa | Phase 2 |
| Auth overhead (getUser gọi nhiều lần) | 🔴 Nặng | Phase 2 |
| Dashboard Layout block (getAllSettings) | 🔴 Nặng | Phase 3 |
| Thiếu Streaming (Suspense) | 🔴 Nặng | Phase 4 |
| Client bundle nặng | 🟡 Vừa | Phase 5 |

## Quick Commands

- Start Phase 1: `/code phase-01`
- Check progress: `/next`
