# Phase 01: Tách Dashboard Layout thành Server Component
Status: ✅ Completed
Dependencies: Không

## Vấn đề hiện tại

File `src/app/(dashboard)/layout.tsx` đang dùng `'use client'` chỉ vì cần 1 state `mobileOpen` để điều khiển Sidebar trên mobile. Hệ quả:
- **Toàn bộ** `{children}` (tất cả page con) bị ép thành Client Component
- Mất khả năng Server-Side Rendering và Partial Pre-rendering của Next.js
- Bundle JS tăng ~40KB do hydration code không cần thiết
- Mỗi lần navigate, toàn bộ layout phải re-hydrate

## Giải pháp

Tách `mobileOpen` state ra một Client Component riêng (`DashboardShell`), giữ layout.tsx là Server Component.

## Implementation Steps

### 1. Tạo file `src/components/features/DashboardShell.tsx` (Client Component mới)
- [ ] Đánh dấu `'use client'`
- [ ] Chứa state `mobileOpen` + `handleDrawerToggle`
- [ ] Dùng `useCallback` cho `handleDrawerClose` để tránh tạo callback mới mỗi render
- [ ] Render `<TopBar>`, `<Sidebar>`, `<main>{children}</main>`, `<MobileNav>`

```tsx
'use client'

import React, { useState, useCallback } from 'react'
import Sidebar from '@/components/features/Sidebar'
import TopBar from '@/components/features/TopBar'
import MobileNav from '@/components/features/MobileNav'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev)
  }, [])

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <TopBar onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerClose} />
      <main className="flex-1 px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-24 md:ml-60 mb-16 md:mb-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
```

### 2. Sửa file `src/app/(dashboard)/layout.tsx`
- [ ] **Xóa** `'use client'`
- [ ] **Xóa** `useState`, `React` import
- [ ] **Import** `DashboardShell` thay thế
- [ ] Layout trở thành Server Component thuần

```tsx
import DashboardShell from '@/components/features/DashboardShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
```

### 3. Kiểm tra không bị lỗi
- [ ] Chạy `npm run dev`, đảm bảo trang hoạt động bình thường
- [ ] Test: Sidebar mobile mở/đóng đúng
- [ ] Test: Navigate giữa các trang không bị lỗi
- [ ] Test: Dark mode vẫn hoạt động

## Files thay đổi
- `src/components/features/DashboardShell.tsx` — **TẠO MỚI**
- `src/app/(dashboard)/layout.tsx` — **SỬA** (bỏ 'use client', dùng DashboardShell)

## Lưu ý quan trọng
- `Sidebar`, `TopBar`, `MobileNav` đều đã là `'use client'` rồi → không cần sửa
- Việc layout thành Server Component **không** làm mất khả năng interactive của các component con (chúng vẫn là Client Component)
- Lợi ích chính: `{children}` (page content) giờ có thể là Server Component → giảm bundle, tải nhanh hơn

## Kết quả mong đợi
- Giảm ~20-35% thời gian tải trang ban đầu
- Bundle JS nhỏ hơn (bỏ hydration overhead)
- Các page con có thể tận dụng Server Component rendering

---
Next Phase: [phase-02-optimize-database-queries.md](./phase-02-optimize-database-queries.md)
