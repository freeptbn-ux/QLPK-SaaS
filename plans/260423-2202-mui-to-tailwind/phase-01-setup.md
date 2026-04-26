# Phase 01: Setup Tailwind CSS + Dependency Migration
Status: ✅ Completed
Dependencies: None (Phase đầu tiên)

## Objective
Cài đặt Tailwind CSS v4, cấu hình cho Next.js 16, và chuẩn bị cho việc gỡ MUI. Phase này tập trung vào **hạ tầng**, chưa sửa bất kỳ component nào.

## Requirements
### Functional
- [x] Tailwind CSS v4 hoạt động với Next.js 16
- [x] Dark mode hoạt động qua `class` strategy
- [x] Custom breakpoints match MUI breakpoints (xs: 0, sm: 600px, md: 900px, lg: 1200px, xl: 1536px)
- [x] Google Fonts (Inter) tích hợp qua Tailwind

### Non-Functional
- [x] Build thành công (cả MUI lẫn Tailwind tồn tại song song tạm thời)
- [x] Dev server khởi động bình thường
- [x] Không ảnh hưởng UI hiện tại trong quá trình migration

## Implementation Steps

### 1. Install Tailwind CSS v4 cho Next.js
1. [x] Install Tailwind CSS v4:
   ```bash
   npm install tailwindcss @tailwindcss/postcss postcss
   ```

2. [x] Install `react-icons` (thay thế `@mui/icons-material`):
   ```bash
   npm install react-icons
   ```

3. [x] Install `clsx` + `tailwind-merge` cho class merging:
   ```bash
   npm install clsx tailwind-merge
   ```

### 2. Configure PostCSS
4. [x] Tạo/cập nhật `postcss.config.mjs`:
   ```js
   const config = {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };
   export default config;
   ```

### 3. Configure Tailwind CSS v4 
5. [x] Cập nhật `src/app/globals.css` - thêm Tailwind imports:
   ```css
   @import "tailwindcss";
   
   /* Custom theme - giữ tương thích với MUI theme hiện tại */
   @theme {
     --color-primary-50: #eff6ff;
     --color-primary-100: #dbeafe;
     --color-primary-200: #bfdbfe;
     --color-primary-300: #93c5f8;
     --color-primary-400: #60a5fa;
     --color-primary-500: #3b82f6;
     --color-primary-600: #2563eb;
     --color-primary-700: #1e40af;
     --color-primary-800: #1e3a8a;
     --color-primary-900: #1e3b8a;

     --color-secondary-400: #a78bfa;
     --color-secondary-500: #8b5cf6;
     --color-secondary-600: #7c3aed;
     --color-secondary-700: #5b21b6;
     
     /* Background colors matching MUI theme */
     --color-surface: #ffffff;
     --color-surface-dark: #1e293b;
     --color-background: #f8fafc;
     --color-background-dark: #0f172a;
     
     /* Custom breakpoints matching MUI */
     --breakpoint-xs: 0px;
     --breakpoint-sm: 600px;
     --breakpoint-md: 900px;
     --breakpoint-lg: 1200px;
     --breakpoint-xl: 1536px;
     
     /* Border radius matching MUI theme */
     --radius-DEFAULT: 12px;
     --radius-sm: 8px;
     --radius-lg: 16px;
     
     /* Font family */
     --font-sans: "Inter", "Roboto", "Helvetica", "Arial", sans-serif;
   }
   ```

### 4. Tạo utility function cho class merging
6. [x] Tạo `src/lib/utils/cn.ts`:
   ```ts
   import { clsx, type ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

### 5. Verify setup
7. [x] Chạy `npm run dev` - đảm bảo không lỗi
8. [x] Thêm 1 Tailwind class test vào 1 page để verify hoạt động
9. [x] Chạy `npm run build` - đảm bảo build thành công

## Files to Create/Modify
- `package.json` - Thêm Tailwind dependencies
- `postcss.config.mjs` - PostCSS config cho Tailwind v4
- `src/app/globals.css` - Thêm Tailwind imports + theme
- `src/lib/utils/cn.ts` - Class merging utility (NEW)

## Test Criteria
- [ ] `npm run dev` chạy thành công
- [ ] `npm run build` build thành công  
- [ ] Tailwind classes render đúng trong browser
- [ ] UI hiện tại (MUI) vẫn hoạt động bình thường
- [ ] Dark mode toggle vẫn hoạt động

## Notes
- **KHÔNG gỡ MUI** trong phase này. MUI và Tailwind sẽ tồn tại song song cho đến Phase 07.
- Tailwind CSS v4 dùng CSS-native configuration thay vì `tailwind.config.js` - mọi config đặt trong CSS file.
- Custom breakpoints cần match MUI breakpoints (đặc biệt `md: 900px` thay vì Tailwind default `md: 768px`) để đảm bảo layout không bị vỡ.
- Phải giữ `@layer mui;` trong globals.css để MUI vẫn hoạt động trong giai đoạn chuyển tiếp.

---
Next Phase: [phase-02-design-system.md](./phase-02-design-system.md)
