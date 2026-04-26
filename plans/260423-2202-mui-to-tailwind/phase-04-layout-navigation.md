# Phase 04: Layout & Navigation Migration
Status: ✅ Completed
Dependencies: Phase 02 (Design System), Phase 03 (UI Primitives)

## Objective
Chuyển đổi toàn bộ hệ thống layout (Dashboard, Auth) và navigation (TopBar, Sidebar, MobileNav) từ MUI sang Tailwind CSS. Đây là "khung xương" của ứng dụng.

## Requirements
### Functional
- [x] Dashboard layout: sidebar + main content hoạt động responsive
- [x] Auth layout: centered card layout
- [x] TopBar: logo, dark mode toggle, user menu
- [x] Sidebar: desktop (permanent) + mobile (slide-in drawer)
- [x] MobileNav: bottom navigation bar trên mobile
- [x] Responsive: Sidebar ẩn trên mobile, MobileNav ẩn trên desktop

### Non-Functional  
- [x] Không import `@mui/material` trong các layout/nav components
- [x] Smooth transitions khi mở/đóng mobile drawer
- [x] MUI icons được thay bằng `react-icons`

## Implementation Steps

### 1. TopBar.tsx
1. [ ] Rewrite `src/components/features/TopBar.tsx`:
   - **MUI removed**: `AppBar`, `Toolbar`, `Typography`, `IconButton`, `Box`, `Avatar`, `Menu`, `MenuItem`, `Tooltip`, `useTheme`, `useMediaQuery`
   - **MUI icons removed**: `MenuIcon`, `Brightness4Icon`, `Brightness7Icon`, `LogoutIcon`
   - **Tailwind approach**:
     - `<header>` with `fixed top-0 z-50 w-full` 
     - Border-bottom thay cho box-shadow
     - User dropdown menu: custom với state + `useRef` click-outside
   - **react-icons replacements**:
     - `MenuIcon` → `HiOutlineBars3` (from `react-icons/hi2`)
     - `Brightness4Icon` → `HiOutlineMoon`
     - `Brightness7Icon` → `HiOutlineSun`
     - `LogoutIcon` → `HiOutlineArrowRightOnRectangle`
   - **Responsive**: ẩn hamburger menu trên `md:` breakpoint
   - **useMediaQuery** thay bằng CSS `hidden md:block` pattern

### 2. Sidebar.tsx
2. [ ] Rewrite `src/components/features/Sidebar.tsx`:
   - **MUI removed**: `Drawer`, `List`, `ListItem`, `ListItemButton`, `ListItemIcon`, `ListItemText`, `Toolbar`, `Divider`, `Box`, `Typography`
   - **MUI icons removed**: `PeopleIcon`, `LocalPharmacyIcon`, `BarChartIcon`, `CalculateIcon`, `SettingsIcon`, `LogoutIcon`
   - **Tailwind approach**:
     - Desktop: `<aside>` with `hidden md:flex fixed left-0 top-0 w-60 h-full`
     - Mobile: overlay drawer với `translate-x` animation
     - Active nav item: `bg-primary-600 text-white` 
     - Hover state: `hover:bg-gray-100 dark:hover:bg-gray-800`
   - **react-icons replacements**:
     - `PeopleIcon` → `HiOutlineUsers`
     - `LocalPharmacyIcon` → `HiOutlineBeaker`
     - `BarChartIcon` → `HiOutlineChartBar`
     - `CalculateIcon` → `HiOutlineCalculator`
     - `SettingsIcon` → `HiOutlineCog6Tooth`
     - `LogoutIcon` → `HiOutlineArrowRightOnRectangle`

### 3. MobileNav.tsx
3. [ ] Rewrite `src/components/features/MobileNav.tsx`:
   - **MUI removed**: `BottomNavigation`, `BottomNavigationAction`, `Paper`
   - **MUI icons**: same as Sidebar
   - **Tailwind approach**:
     - `<nav>` with `fixed bottom-0 left-0 right-0 md:hidden`
     - Grid of 5 nav items
     - Active state: `text-primary-600` + icon filled variant
     - Background: `bg-surface dark:bg-surface-dark shadow-lg`

### 4. Dashboard Layout
4. [ ] Rewrite `src/app/(dashboard)/layout.tsx`:
   - **MUI removed**: `Box`, `Toolbar`, `useTheme`, `useMediaQuery`
   - **Tailwind approach**:
     - `<div className="flex min-h-screen">` wrapper
     - Main content: `flex-1 p-6 md:ml-60 mt-16 mb-14 md:mb-0`
     - Responsive spacing tính cho TopBar height (64px) và Sidebar width (240px)
   - **useMediaQuery** bỏ → responsive behavior qua CSS classes

### 5. Auth Layout
5. [ ] Rewrite `src/app/(auth)/layout.tsx`:
   - **MUI removed**: `Box`, `Container`
   - **Tailwind approach**:
     - `<div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">`
     - `<div className="w-full max-w-md px-4">`

### 6. Root Layout Update
6. [ ] Update `src/app/layout.tsx`:
   - Đảm bảo `ThemeRegistry` vẫn wrap đúng
   - Đảm bảo font Inter loaded

### 7. Error & Loading Pages
7. [ ] Update `src/app/(dashboard)/error.tsx`:
   - Bỏ MUI imports nếu có
   - Dùng Tailwind cho error UI

## Files to Modify
| File | Complexity | MUI Components Used |
|------|-----------|---------------------|
| `src/components/features/TopBar.tsx` | 🔴 High | AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip, useTheme, useMediaQuery + 4 icons |
| `src/components/features/Sidebar.tsx` | 🔴 High | Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box + 6 icons |
| `src/components/features/MobileNav.tsx` | 🟡 Medium | BottomNavigation, BottomNavigationAction, Paper + 5 icons |
| `src/app/(dashboard)/layout.tsx` | 🟡 Medium | Box, Toolbar, useTheme, useMediaQuery |
| `src/app/(auth)/layout.tsx` | 🟢 Low | Box, Container |
| `src/app/layout.tsx` | 🟢 Low | Minor updates |
| `src/app/(dashboard)/error.tsx` | 🟢 Low | Check MUI usage |

## Test Criteria
- [ ] Desktop: Sidebar visible permanently, MobileNav hidden
- [ ] Mobile (< 900px): Sidebar hidden, MobileNav visible at bottom
- [ ] Hamburger menu opens/closes mobile sidebar drawer
- [ ] Active nav item highlighted correctly based on current route
- [ ] Dark mode toggle works in TopBar
- [ ] User menu dropdown opens/closes correctly
- [ ] Logout action works
- [ ] Auth layout centers the login card
- [ ] Dashboard content doesn't overlap with sidebar/topbar
- [ ] Smooth drawer animation on mobile

## Notes
- **Breakpoint quan trọng**: MUI `md` = 900px. Tailwind custom breakpoint đã được set ở Phase 01. Đảm bảo dùng `md:` prefix cho responsive.
- `useMediaQuery` không cần nữa. Thay bằng CSS responsive classes (`hidden md:block`, `md:hidden`).
- Mobile drawer cần overlay backdrop (`bg-black/50`) khi mở.
- Transition cho drawer: `transform transition-transform duration-300 ease-in-out`.

---
Previous Phase: [phase-03-ui-primitives.md](./phase-03-ui-primitives.md)
Next Phase: [phase-05a-features-patients-medicines.md](./phase-05a-features-patients-medicines.md)
