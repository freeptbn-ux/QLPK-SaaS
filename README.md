# QLPK SaaS - Hệ thống Quản lý Phòng khám Thông minh

![QLPK SaaS Logo](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

**QLPK SaaS** là một giải pháp quản lý phòng khám hiện đại, đa nền tảng, được xây dựng để giúp các bác sĩ và nhân viên y tế quản lý công việc hiệu quả hơn. Hệ thống tập trung vào trải nghiệm người dùng, tính chính xác trong kê đơn và khả năng quản lý kho thuốc thông minh.

## ✨ Tính năng chính

- 🏥 **Quản lý Bệnh nhân**: Hồ sơ bệnh án chi tiết, tìm kiếm thông minh với Trigram Index.
- 💊 **Quản lý Kho thuốc**: Theo dõi nhập/xuất, tồn kho thực tế, đơn giá và liều dùng mẫu.
- 📝 **Kê đơn Thông minh**: Tự động tính toán liều lượng thuốc, tổng tiền và xuất đơn thuốc chuyên nghiệp.
- 📊 **Thống kê & Báo cáo**: Theo dõi doanh thu theo tháng, số lượng bệnh nhân và hiệu suất phòng khám.
- 🎨 **Giao diện Cao cấp**: Hỗ trợ Chế độ Sáng/Tối, hiệu ứng Glassmorphism và chuyển động mượt mà với Framer Motion.
- 📱 **Thiết kế Đáp ứng (Responsive)**: Hoạt động hoàn hảo trên mọi thiết bị từ Mobile đến Desktop.

## 🛠️ Công nghệ sử dụng

- **Frontend Core**: Next.js 16.2 (App Router), React 19.
- **Styling**: Vanilla CSS kết hợp Tailwind CSS v4 (Design System mạnh mẽ).
- **Cơ sở dữ liệu**: Supabase (Postgres) với các SQL RPC tối ưu hiệu năng.
- **Biểu đồ**: Recharts cho các báo cáo doanh thu trực quan.
- **Xử lý Form**: React Hook Form & Zod (Validation chặt chẽ).
- **Hiệu ứng**: Framer Motion cho trải nghiệm người dùng mượt mà.
- **Ngôn ngữ**: TypeScript 5+.

## 🚀 Hướng dẫn cài đặt

### 1. Chuẩn bị môi trường
- Node.js 18+ 
- Tài khoản Supabase

### 2. Cài đặt Project
```bash
# Clone repository
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git

# Di chuyển vào thư mục dự án
cd QLPK-SaaS

# Cài đặt các gói phụ thuộc
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Khởi chạy
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt của bạn.

## 📁 Cấu trúc dự án

- `src/app`: Routes và layouts (Next.js App Router).
- `src/components`: Các UI Components (Features, UI, Layout).
- `src/actions`: Server Actions tương tác với database.
- `src/lib`: Cấu hình Supabase, Utils, Hooks.
- `supabase/migrations`: Các file SQL migration cho database.
- `.brain`: Tài liệu và kiến thức dự án (được đồng bộ).

## 📄 Bản quyền

Copyright 2026 Nguyễn Duy Trường. All rights reserved.

---
*Dự án được phát triển với sự hỗ trợ của Antigravity AI.*
