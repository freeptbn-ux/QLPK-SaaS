# Phase 02: Design System + Theme Migration
Status: ✅ Done
Dependencies: Phase 01 (Tailwind installed)

## Objective
Tạo hệ thống thiết kế mới bằng Tailwind CSS thay thế MUI Theme. Chuyển đổi Dark Mode từ MUI `ThemeProvider` sang Tailwind `dark:` variant + CSS custom properties. Đây là **nền tảng** cho tất cả các phases sau.

## Requirements
### Functional
- [ ] Dark/Light mode toggle hoạt động qua HTML class + CSS variables
- [ ] Tất cả màu sắc MUI theme được map sang Tailwind CSS variables
- [ ] Glassmorphism constants hoạt động với Tailwind
- [ ] ThemeContext cung cấp `mode` và `toggleTheme` (giữ nguyên API)

### Non-Functional
- [ ] Không phụ thuộc MUI `ThemeProvider`
- [ ] Không phụ thuộc `@emotion/*` runtime
- [ ] SSR-compatible (no flash of unstyled content)

## Implementation Steps

### 1. Xây dựng Theme Provider mới (không MUI)
1. [ ] Rewrite `src/theme/ThemeContext.tsx`:
   - Bỏ import MUI `ThemeProvider`, `CssBaseline`
   - Thay bằng logic set class `dark` trên `<html>` element
   - Giữ nguyên API: `useThemeContext()` → `{ mode, toggleTheme }`
   - SSR-safe: đọc `localStorage` chỉ trên client

2. [ ] Xóa `src/theme/theme.ts` (MUI theme definitions)

3. [ ] Update `src/theme/constants.ts` - chuyển GLASSMORPHISM sang Tailwind-compatible:
   ```ts
   // Giữ nguyên values, chỉ thêm Tailwind classes
   export const GLASS = {
     card: 'backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-white/10 shadow-lg',
   };
   ```

### 2. Rewrite ThemeRegistry
4. [ ] Rewrite `src/components/ThemeRegistry.tsx`:
   - Bỏ `AppRouterCacheProvider` (MUI SSR)
   - Giữ `ThemeContextProvider`, `ToastProvider`, `GlobalShortcuts`
   - Đơn giản hóa wrapper

### 3. Xây dựng CSS Design System
5. [ ] Mở rộng `src/app/globals.css` với design tokens:
   ```css
   @import "tailwindcss";
   
   @theme {
     /* Colors - giữ tương thích MUI */
     --color-primary-*: ...
     --color-error-*: ...
     --color-warning-*: ...
     --color-success-*: ...
     --color-info-*: ...
     
     /* Shadows matching MUI */
     --shadow-card: 0px 1px 3px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.06);
     --shadow-elevated: 0px 4px 12px rgba(37,99,235,0.2);
   }
   
   /* Base styles */
   @layer base {
     html { @apply h-full; }
     body { 
       @apply min-h-full flex flex-col font-sans antialiased;
       @apply bg-background text-foreground;
       @apply dark:bg-background-dark dark:text-white;
     }
   }
   ```

### 4. Tạo Tailwind Component Utilities
6. [ ] Tạo custom component classes trong globals.css nếu cần (cho patterns lặp lại nhiều):
   ```css
   @layer components {
     .btn-primary { @apply bg-primary-600 text-white rounded-xl px-4 py-2 font-semibold hover:shadow-elevated transition-shadow; }
     .btn-outlined { @apply border border-primary-600 text-primary-600 rounded-xl px-4 py-2 font-semibold hover:bg-primary-50 transition-colors; }
     .card { @apply bg-surface dark:bg-surface-dark rounded-xl shadow-card border border-gray-100 dark:border-gray-800; }
     .input-field { @apply w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all; }
   }
   ```

### 5. Update Root Layout
7. [ ] Update `src/app/layout.tsx`:
   - Thêm class `dark` handling trên `<html>` tag
   - Import Inter font từ `next/font/google`

## Files to Create/Modify
- `src/theme/ThemeContext.tsx` - Rewrite: bỏ MUI, dùng HTML class toggle
- `src/theme/theme.ts` - **XÓA** (MUI theme)
- `src/theme/constants.ts` - Update: thêm Tailwind class equivalents
- `src/components/ThemeRegistry.tsx` - Rewrite: bỏ MUI AppRouterCacheProvider
- `src/app/globals.css` - Update: thêm design tokens + base styles
- `src/app/layout.tsx` - Update: dark mode class, font import

## Test Criteria
- [ ] Toggle dark/light mode hoạt động (class `dark` thêm/bỏ trên `<html>`)
- [ ] Màu sắc chuyển đổi smooth khi toggle theme
- [ ] Persist theme preference qua localStorage
- [ ] Respect system preference nếu chưa có saved preference
- [ ] `npm run build` thành công
- [ ] Không flash of wrong theme khi load trang

## Notes
- **Quan trọng:** Phase này sẽ break một số MUI components vì bỏ `ThemeProvider`. Đó là expected - các phases sau sẽ fix từng component.
- Nếu muốn chạy song song tạm thời, có thể giữ lại `ThemeProvider` bên trong `ThemeRegistry` cho đến khi tất cả components được migrate.
- Tailwind CSS v4 dark mode mặc định dùng `@media (prefers-color-scheme: dark)`. Để dùng class-based, cần config: `@variant dark (&:is(.dark *))` trong CSS.

---
Previous Phase: [phase-01-setup.md](./phase-01-setup.md)
Next Phase: [phase-03-ui-primitives.md](./phase-03-ui-primitives.md)
