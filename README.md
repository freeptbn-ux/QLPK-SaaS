# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB-green?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)

QLPK-SaaS là một giải pháp quản lý phòng khám hiện đại, được xây dựng trên nền tảng Web với kiến trúc SaaS, giúp tối ưu hóa quy trình khám chữa bệnh, kê đơn thuốc và quản lý hồ sơ bệnh nhân.

## ✨ Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ thông tin cơ bản, tiểu sử bệnh lý và lịch sử khám bệnh.
- **Kê đơn thuốc**: Giao diện kê đơn thông minh, hỗ trợ tính toán liều lượng thuốc nhi khoa và tra cứu liều dùng bằng AI.
- **Kho thuốc**: Quản lý danh mục thuốc, đơn giá, quy cách đóng gói và tồn kho.
- **Tính liều nhanh**: Công cụ hỗ trợ bác sĩ tính liều siro/hỗn dịch dựa trên cân nặng cho trẻ em.
- **Thống kê**: Theo dõi doanh thu, số lượng bệnh nhân và hiệu suất phòng khám qua biểu đồ trực quan.
- **Tích hợp Gemini AI**: Tra cứu liều dùng thuốc và hướng dẫn sử dụng nhanh chóng bằng mô hình `gemini-2.5-flash-lite`.

## 🚀 Công nghệ sử dụng

### Frontend & Backend
- **Framework**: Next.js 16 (App Router)
- **UI/UX**: React 19, Tailwind CSS 4, Framer Motion (Animations)
- **Icons**: React Icons (Heroicons 2)
- **State Management & Forms**: React Hook Form, Zod

### Cơ sở dữ liệu & Auth
- **Backend-as-a-Service**: Supabase (PostgreSQL)
- **ORM/Client**: Supabase JS, pg

### AI Integration
- **Model**: Google Gemini 2.5 Flash Lite
- **Features**: API Rotation (Xoay tua API key), Server-side calls

### Testing
- **Framework**: Vitest
- **Library**: React Testing Library

## 📦 Cấu trúc thư mục

```text
├── src/
│   ├── actions/        # Server Actions (API & DB mutations)
│   ├── app/           # Next.js App Router (Routes & Pages)
│   ├── components/    # Reusable UI Components
│   ├── contexts/      # React Contexts
│   ├── hooks/         # Custom React Hooks
│   ├── lib/           # Tiện ích (Supabase client, utils, validations)
│   ├── theme/         # Cấu hình giao diện
│   └── types/         # TypeScript interfaces & types
├── supabase/          # Database migrations & configuration
├── tests/             # Cấu hình và file kiểm thử
├── plans/             # Kế hoạch triển khai các tính năng
└── .brain/            # Eternal Context (Lưu trữ ngữ cảnh AI)
```

## 🛠️ Hướng dẫn cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env.local` dựa trên mẫu `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEYS=key1,key2,key3
   ```

4. **Chạy dự án ở chế độ phát triển:**
   ```bash
   npm run dev
   ```

5. **Build cho production:**
   ```bash
   npm run build
   npm start
   ```

## 🧪 Kiểm thử

Chạy bộ công cụ kiểm thử tự động:
```bash
npm test
```

## 📝 Thông tin bổ sung

Hệ thống được thiết kế để hoạt động tốt trên cả Desktop và Mobile (Responsive), tối ưu hóa tốc độ tải trang bằng cách sử dụng Server Components và caching dữ liệu thông minh.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường. All rights reserved.
