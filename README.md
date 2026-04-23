# Quản Lý Phòng Khám Nhi (QLPK-SaaS)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

Một giải pháp phần mềm hiện đại dựa trên nền tảng SaaS dành cho việc quản lý các phòng khám nhi khoa. Dự án được tối ưu hóa cho quy trình khám bệnh, quản lý bệnh nhi, đơn thuốc và thống kê báo cáo.

## 🚀 Đặc điểm nổi bật

- **Di chuyển sang Tailwind CSS**: Hệ thống UI đã được chuyển đổi hoàn toàn từ MUI sang Tailwind CSS v4, giúp giảm đáng kể bundle size và tăng hiệu năng SSR.
- **Modern Tech Stack**: Sử dụng các công nghệ mới nhất như React 19, Next.js 15 và Vite/Vitest để phát triển và kiểm thử.
- **Responsive & Dark Mode**: Hỗ trợ đầy đủ giao diện sáng/tối và tương thích tốt trên mọi thiết bị di động.
- **Quản lý dữ liệu mạnh mẽ**: Tích hợp Supabase cho Database, Auth và Storage.

## 🛠️ Công nghệ sử dụng

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management & Logic**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Backend Service**: [Supabase](https://supabase.com/) (PostgreSQL + Server Actions)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Hi2, Lu variants)

## 📂 Cấu trúc thư mục

```text
src/
├── actions/        # Server Actions (Xử lý logic Database & Auth)
├── app/            # App Router (Pages, Layouts, APIs)
├── components/     # React Components (UI & Features)
├── hooks/          # Custom Hooks
├── lib/            # Shared utilities, Supabase client, Validations
├── theme/          # Theme Context & Dark mode logic
├── types/          # TypeScript Type Definitions
└── __tests__/      # Global tests setup
```

## ⚙️ Cài đặt và Sử dụng

### 1. Cài đặt dependency
```bash
npm install
```

### 2. Chạy môi trường phát triển
```bash
npm run dev
```

### 3. Build cho Production
```bash
npm run build
npm run start
```

### 4. Chạy Kiểm thử
```bash
npm run test
```

## 📝 Thông tin bổ sung

- Dự án sử dụng cấu trúc **Server Actions** để giao tiếp với Supabase, giúp bảo mật hơn và tối ưu hóa hiệu năng render phía server.
- Các biểu đồ thống kê được xây dựng linh hoạt, hỗ trợ lọc theo thời gian (ngày, tuần, tháng, năm).
- Hệ thống quản lý thuốc hỗ trợ cảnh báo khi tồn kho thấp.

---

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường
