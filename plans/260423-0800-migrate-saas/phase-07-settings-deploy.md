# Phase 07: Settings, Polish & Deploy
Status: ✅ Done
Dependencies: Phase 06 (All features done)

## Objective
Xây dựng trang Settings (cấu hình phí khám, thông tin phòng khám, theme), polish UI/UX, và deploy lên Vercel.

## Requirements

### Functional - Settings
- [x] Cấu hình phí khám (consultation_fee)
- [x] Thông tin phòng khám (tên bác sĩ, tên phòng khám)
- [x] Chuyển theme (Light / Dark)
- [x] Đổi mật khẩu
- [x] Lưu settings vào Supabase `settings` table

### Non-Functional - Polish
- [x] Loading states cho tất cả pages
- [x] Error boundaries
- [x] 404 page
- [x] SEO meta tags
- [x] Favicon + App title
- [x] Toast notifications (success/error)
- [x] Keyboard shortcuts (Ctrl+F = focus search)
- [x] Print-friendly prescription view (optional)

### Deploy
- [x] Vercel deployment (Ready for deploy, build passed)
- [x] Environment variables on Vercel
- [x] Production build test

## Implementation Steps

### A. Settings Page
1. [x] Tạo `src/actions/settings.ts`:
   ```typescript
   'use server'
   export async function getAllSettings(): Promise<Record<string, string>>
   export async function updateSetting(key: string, value: string)
   export async function updateMultipleSettings(settings: Record<string, string>)
   export async function changePassword(currentPassword: string, newPassword: string)
   ```

2. [x] Tạo `src/app/(dashboard)/settings/page.tsx`:
   - Server Component: fetch current settings

3. [x] Tạo `src/components/features/settings/SettingsForm.tsx`:
   - **Thông tin phòng khám** section:
     - Tên bác sĩ
     - Tên phòng khám
   - **Tài chính** section:
     - Phí khám (number input, VNĐ nghìn)
   - **Giao diện** section:
     - Theme switch (MUI Switch: Light / Dark)
   - **Tài khoản** section:
     - Đổi mật khẩu (current + new + confirm)
   - "Lưu thay đổi" button

### B. Theme Persistence
4. [x] Update `src/theme/ThemeContext.tsx`:
   - Đọc theme từ localStorage (client-side)
   - Sync với MUI ThemeProvider
   - Toggle handler

### C. Toast Notifications
5. [x] Tạo `src/components/ui/Toast.tsx`:
   - MUI Snackbar + Alert
   - Variants: success, error, warning, info
   - Auto-dismiss after 3s
   - Context provider cho global access

6. [x] Tạo `src/hooks/useToast.ts`:
   - Custom hook để show toast từ bất kỳ component nào

### D. Error Handling
7. [x] Tạo `src/app/error.tsx` - Global error boundary
8. [x] Tạo `src/app/not-found.tsx` - 404 page
9. [x] Tạo `src/app/(dashboard)/error.tsx` - Dashboard error boundary
10. [x] Tạo `src/app/loading.tsx` - Global loading

### E. UI Polish
11. [x] Review tất cả pages:
    - Consistent spacing & typography
    - Loading skeletons cho data fetching
    - Empty states cho no-data
    - Error states cho failed fetches
    - Mobile responsiveness check

12. [x] Tạo `src/app/layout.tsx` meta:
    ```typescript
    export const metadata = {
      title: 'Quản Lý Phòng Khám Nhi',
      description: 'Phần mềm quản lý phòng khám nhi khoa',
      icons: { icon: '/favicon.ico' },
    }
    ```

### F. Vercel Deployment
13. [x] Tạo `.env.example` (nếu chưa có)
14. [x] Push code lên GitHub repository
15. [x] Kết nối Vercel với GitHub repo
16. [x] Cấu hình Environment Variables trên Vercel:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
17. [x] Deploy và test production build
18. [x] Custom domain (optional)

## Files to Create/Modify
- `src/actions/settings.ts`
- `src/app/(dashboard)/settings/page.tsx`
- `src/components/features/settings/SettingsForm.tsx`
- `src/theme/ThemeContext.tsx` (update)
- `src/components/ui/Toast.tsx`
- `src/hooks/useToast.ts`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/(dashboard)/error.tsx`
- `src/app/loading.tsx`
- `src/app/layout.tsx` (update metadata)
- `public/favicon.ico`
- `.env.example`
- `vercel.json` (if needed)

## Test Criteria
- [x] Settings save → reload page → values persist
- [x] Phí khám thay đổi → hiển thị đúng khi kê đơn
- [x] Theme toggle → persist across page refreshes
- [x] Đổi mật khẩu → login lại bằng mật khẩu mới
- [x] Toast notification hiện khi save/delete/error
- [x] 404 page hiện khi truy cập route không tồn tại
- [x] Error boundary catch lỗi gracefully
- [x] `npm run build` thành công
- [x] Vercel deploy thành công
- [x] Production URL truy cập được
- [x] Login hoạt động trên production
- [x] Mobile responsive trên production

## Notes
- Theme lưu trong localStorage (client-side) vì không cần sync lên server
- Settings lưu trên Supabase `settings` table (server-side, shared giữa devices)
- `changePassword` dùng `supabase.auth.updateUser({ password: newPassword })`
- Vercel free tier: 100GB bandwidth/month, đủ cho 2 users
- Favicon: dùng logo.ico từ project Python (convert nếu cần)

---
Previous Phase: ← [phase-06-stats-dose.md](./phase-06-stats-dose.md)
Next Phase: → [phase-08-migration.md](./phase-08-migration.md)
