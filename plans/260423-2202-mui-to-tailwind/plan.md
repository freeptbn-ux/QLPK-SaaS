# Plan: MUI V9 → Tailwind CSS Migration
Created: 2026-04-23T22:02:00+07:00
Status: 🟡 In Progress

## Overview
Chuyển đổi toàn bộ hệ thống UI từ **MUI V9 + Emotion** sang **Tailwind CSS** cho dự án QLPK-SaaS (Quản Lý Phòng Khám Nhi).

### Lý do chuyển đổi
- Giảm bundle size (MUI + Emotion khá nặng)
- Tăng tốc độ phát triển với utility-first CSS
- Loại bỏ phụ thuộc vào CSS-in-JS runtime
- Cải thiện performance SSR (Next.js + Tailwind hoạt động tốt hơn)

### Phạm vi ảnh hưởng
- **50+ files** cần migration
- **8 MUI packages** cần gỡ bỏ
- **Dark mode** cần chuyển từ MUI ThemeProvider sang Tailwind `dark:` variant
- **Responsive** cần chuyển từ MUI breakpoints sang Tailwind responsive classes

## Tech Stack
- Frontend: Next.js 16 + React 19 + **Tailwind CSS v4**
- Icon: `react-icons` (thay thế `@mui/icons-material`)
- Animation: `framer-motion` (giữ nguyên)
- Charts: `recharts` (giữ nguyên, không phụ thuộc MUI)
- Forms: `react-hook-form` + `zod` (giữ nguyên)

## MUI Components Inventory

### Packages cần gỡ
| Package | Vai trò |
|---------|---------|
| `@mui/material` | Core components |
| `@mui/icons-material` | Icons |
| `@mui/material-nextjs` | SSR cache provider |
| `@emotion/cache` | CSS-in-JS cache |
| `@emotion/react` | CSS-in-JS runtime |
| `@emotion/styled` | Styled components |

### MUI Components đang sử dụng → Tailwind equivalent

| MUI Component | Số files dùng | Tailwind Approach |
|--------------|---------------|-------------------|
| `Box` | ~30+ | `<div>` + utility classes |
| `Typography` | ~30+ | Semantic HTML (`h1`-`h6`, `p`, `span`) + font utilities |
| `Button` | ~15 | Custom `<button>` component + variants |
| `TextField` | ~10 | Custom `<input>` component |
| `Grid` | ~10 | `grid` / `flex` utilities |
| `Card/CardContent/CardHeader` | ~10 | Custom card component |
| `Table/TableHead/TableBody/TableRow/TableCell` | ~8 | HTML `<table>` + Tailwind |
| `Dialog/DialogTitle/DialogContent/DialogActions` | ~6 | Custom modal/dialog component |
| `Alert` | ~5 | Custom alert component |
| `IconButton` | ~10 | Custom icon button |
| `Chip` | ~3 | Custom badge/chip |
| `AppBar/Toolbar` | ~3 | Custom header/navbar |
| `Drawer` | ~2 | Custom sidebar |
| `BottomNavigation` | 1 | Custom bottom nav |
| `Snackbar` | 1 | Custom toast |
| `Autocomplete` | 1 | Custom combobox |
| `Switch/Radio/RadioGroup` | ~3 | Custom toggle/radio |
| `FormControl/FormLabel/FormHelperText` | ~5 | Custom form field wrapper |
| `InputAdornment` | ~3 | Input with icon prefix/suffix |
| `Skeleton` | ~3 | Custom skeleton with `animate-pulse` |
| `CircularProgress` | ~4 | Custom spinner |
| `Divider` | ~5 | `<hr>` or border utility |
| `Avatar` | ~2 | Custom avatar |
| `Tooltip` | ~5 | Custom tooltip or title attr |
| `Menu/MenuItem` | ~2 | Custom dropdown |
| `Collapse` | ~1 | Tailwind transition |
| `Stack` | ~2 | `flex` + `gap` |
| `Container` | ~1 | `max-w-*` + `mx-auto` |
| `styled()` | ~3 | Tailwind utilities directly |
| `useTheme/useMediaQuery` | ~5 | Tailwind responsive + CSS variables |

## Phases

| Phase | Name | Status | Progress | Files |
|-------|------|--------|----------|-------|
| 01 | Setup Tailwind + Dependencies | ⬜ Pending | 0% | ~5 |
| 02 | Design System + Theme | ⬜ Pending | 0% | ~8 |
| 03 | UI Primitives (components/ui) | ⬜ Pending | 0% | ~8 |
| 04 | Layout & Navigation | ⬜ Pending | 0% | ~7 |
| 05a | Feature Components - Patients & Medicines | ⬜ Pending | 0% | ~12 |
| 05b | Feature Components - Prescriptions, Stats, Settings | ⬜ Pending | 0% | ~14 |
| 06 | Pages, Error Boundaries & Tests | ⬜ Pending | 0% | ~12 |
| 07 | Cleanup & Final Verification | ⬜ Pending | 0% | ~5 |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dark mode regression | 🟡 Medium | Test mỗi component với cả light/dark |
| Responsive breakpoint mismatch | 🟡 Medium | MUI `md=900px` vs Tailwind `md=768px` - cần custom |
| Form validation UI khác biệt | 🟢 Low | Giữ nguyên logic, chỉ đổi presentation |
| Icon thiếu tương đương | 🟢 Low | react-icons có đầy đủ Material Design icons |
| Test failures do thay đổi DOM | 🔴 High | Cập nhật test selectors + viết lại test setup |
| `styled()` components phức tạp (DateInput) | 🟡 Medium | Rewrite hoàn toàn với Tailwind |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
