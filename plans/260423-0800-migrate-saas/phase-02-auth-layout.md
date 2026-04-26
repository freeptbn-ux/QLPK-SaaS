# Phase 02: Auth & Layout
Status: ✅ Done
Dependencies: Phase 01 (Setup)

## Objective
Xây dựng hệ thống Authentication (Email + Password) với Supabase Auth và Layout chính của ứng dụng (Sidebar Navigation, responsive cho cả desktop và mobile).

## Requirements

### Functional
- [x] Login page với Email + Password
- [x] Protected routes (redirect về login nếu chưa đăng nhập)
- [x] Logout functionality
- [x] Responsive sidebar (desktop: full sidebar, mobile: bottom nav hoặc drawer)
- [x] Active route highlighting

### Non-Functional
- [x] Session tự động refresh qua Middleware (Proxy in Next.js 16)
- [x] Loading states khi checking auth
- [x] Smooth transition animations

## Implementation Steps

### A. Supabase Auth Setup
1. [x] Tạo account trên Supabase Dashboard → Authentication → Users → "Add User" (User responsibility)
2. [x] Tạo `src/lib/supabase/proxy.ts` - Helper function refresh session (Renamed from middleware.ts)

### B. Next.js Middleware (Route Protection)
3. [x] Tạo `src/proxy.ts` (Renamed from middleware.ts for Next.js 16):
   - Refresh Supabase session token trước mỗi request
   - Nếu chưa login → redirect `/login`
   - Nếu đã login mà vào `/login` → redirect `/patients`
   - Matcher: exclude `_next/static`, `_next/image`, `favicon.ico`

### C. Login Page
4. [x] Tạo `src/app/(auth)/login/page.tsx`:
   - Email + Password form
   - MUI TextField, Button components
   - Error handling (sai mật khẩu, network error)
   - Loading state khi submit
   - Redirect về `/patients` sau khi login thành công

### D. Dashboard Layout
5. [x] Tạo `src/app/(dashboard)/layout.tsx`:
   - Sidebar navigation (desktop)
   - Bottom navigation (mobile ≤ 768px)
   - MUI Drawer component
   - Navigation items:
     - 👥 Bệnh nhân (`/patients`)
     - 💊 Kho thuốc (`/medicines`)
     - 📊 Thống kê (`/statistics`)
     - 💉 Tính liều (`/dose-calculator`)
     - ⚙️ Cài đặt (`/settings`)
   - User info + Logout button ở bottom sidebar
   - Active route highlighting

6. [x] Tạo `src/components/features/Sidebar.tsx`:
   - MUI Drawer (permanent trên desktop, temporary trên mobile)
   - MUI List, ListItem, ListItemIcon, ListItemText
   - Sử dụng `usePathname()` để highlight active

7. [x] Tạo `src/components/features/MobileNav.tsx`:
   - MUI BottomNavigation component
   - Hiện trên mobile (< 768px), ẩn sidebar
   - 5 icons tương ứng 5 routes chính

8. [x] Tạo `src/components/features/TopBar.tsx`:
   - App title (configurable từ settings)
   - Theme toggle button (light/dark)
   - Menu icon (mobile - open drawer)
   - Avatar/User dropdown

### E. Server Actions (Auth)
9. [x] Tạo `src/actions/auth.ts`:
   ```typescript
   'use server'
   export async function loginAction(formData: FormData)
   export async function logoutAction()
   ```

### F. Placeholder Pages
10. [x] Tạo placeholder `page.tsx` cho mỗi route:
    - `/patients` → "Bệnh nhân (Coming Phase 03)"
    - `/medicines` → "Kho thuốc (Coming Phase 04)"
    - `/statistics` → "Thống kê (Coming Phase 06)"
    - `/dose-calculator` → "Tính liều (Coming Phase 06)"
    - `/settings` → "Cài đặt (Coming Phase 07)"
11. [x] Tạo `src/app/(dashboard)/page.tsx` redirect sang `/patients`

## Files to Create/Modify
- `src/proxy.ts` - Route protection + session refresh
- `src/lib/supabase/proxy.ts` - Supabase middleware helper
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/layout.tsx` - Auth layout (centered, no sidebar)
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with nav
- `src/app/(dashboard)/page.tsx` - Root redirect
- `src/app/(dashboard)/patients/page.tsx` - Placeholder
- `src/app/(dashboard)/medicines/page.tsx` - Placeholder
- `src/app/(dashboard)/statistics/page.tsx` - Placeholder
- `src/app/(dashboard)/dose-calculator/page.tsx` - Placeholder
- `src/app/(dashboard)/settings/page.tsx` - Placeholder
- `src/components/features/Sidebar.tsx` - Desktop navigation
- `src/components/features/MobileNav.tsx` - Mobile navigation
- `src/components/features/TopBar.tsx` - Top bar
- `src/actions/auth.ts` - Auth server actions

## Test Criteria
- [x] Truy cập `/` → redirect về `/login` (nếu chưa login)
- [x] Login thành công → redirect về `/patients`
- [x] Login sai password → hiện error message
- [x] Truy cập `/patients` khi chưa login → redirect `/login`
- [x] Logout → redirect `/login`
- [x] Sidebar hiện đúng 5 menu items
- [x] Mobile: sidebar ẩn, bottom nav hiện
- [x] Theme toggle light ↔ dark hoạt động
- [x] Active route highlighted đúng

## Notes
- Sử dụng `@supabase/ssr` để tạo client trong middleware (KHÔNG dùng `@supabase/auth-helpers-nextjs` đã deprecated)
- Middleware PHẢI refresh session để tránh expired token
- Login page là Server Component, form submit qua Server Action
- Sidebar dùng MUI Drawer `variant="permanent"` trên desktop
- Mobile breakpoint: `theme.breakpoints.down('md')` (< 900px)

---
Previous Phase: ← [phase-01-setup.md](./phase-01-setup.md)
Next Phase: → [phase-03-patient.md](./phase-03-patient.md)
