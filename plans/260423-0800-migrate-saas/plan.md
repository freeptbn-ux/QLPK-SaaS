# Plan: QLPK-SaaS Migration
Created: 2026-04-23
Status: 🟡 In Progress

## Overview
Migrate phần mềm Quản lý Phòng khám Nhi từ Python Desktop (PySide6 + SQLite) sang Web App SaaS (Next.js + MUI + Supabase), deploy trên Vercel.

## Tech Stack (Researched & Verified April 2026)

| Layer | Package | Version | Lý do chọn |
|-------|---------|---------|-------------|
| **Framework** | Next.js | 16.x (App Router) | Stable, tối ưu Vercel, SSR/SSG |
| **UI Library** | @mui/material | 6.x | Mature, responsive, nhiều component sẵn |
| **MUI + Next.js** | @mui/material-nextjs | latest | SSR style injection chuẩn |
| **Styling** | @emotion/react + @emotion/styled | latest | MUI peer dependency |
| **Database** | Supabase (PostgreSQL) | - | Auth + DB + Realtime tích hợp |
| **Supabase Client** | @supabase/supabase-js | 2.x | Official SDK |
| **Supabase SSR** | @supabase/ssr | latest | Cookie-based auth cho App Router |
| **Charts** | Recharts | 2.x | React-native, SVG, dễ dùng với MUI |
| **Validation** | Zod | 3.x | Schema validation cho Server Actions |
| **Date** | dayjs | 1.x | Lightweight, timezone support |
| **Language** | TypeScript | 5.x | Type safety |
| **Deploy** | Vercel | - | Free tier, tối ưu Next.js |

## Cấu trúc dự án (Chuẩn 2026)

```
QLPK-SaaS/
├── public/                    # Static assets
├── src/
│   ├── app/                   # App Router (routes only)
│   │   ├── (auth)/            # Route group: Login
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/       # Route group: App chính
│   │   │   ├── patients/
│   │   │   ├── medicines/
│   │   │   ├── prescriptions/
│   │   │   ├── statistics/
│   │   │   ├── dose-calculator/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable UI
│   │   ├── ui/                # Primitive components
│   │   └── features/          # Domain components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Supabase client, utils
│   │   └── supabase/
│   ├── actions/               # Server Actions
│   ├── types/                 # TypeScript types
│   └── theme/                 # MUI theme config
├── scripts/                   # Migration scripts
├── docs/                      # BRIEF, specs
├── plans/                     # Plan files
└── supabase/                  # SQL migrations
```

## Phases

| Phase | Name | Status | Est. Tasks |
|-------|------|--------|------------|
| 01 | Project Setup & Supabase | ✅ Done | 12 |
| 02 | Auth & Layout | ✅ Done | 10 |
| 03 | Patient Module | ⬜ Pending | 14 |
| 04 | Medicine & Stock Module | ⬜ Pending | 11 |
| 05 | Prescription Module | ⬜ Pending | 13 |
| 06 | Statistics & Dose Calculator | ⬜ Pending | 12 |
| 07 | Settings, Polish & Deploy | ⬜ Pending | 10 |
| 08 | Data Migration | ⬜ Pending | 8 |

**Tổng: ~90 tasks | Ước tính: ~11 sessions**

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
