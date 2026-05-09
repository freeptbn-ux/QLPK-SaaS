# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB-green?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)

QLPK-SaaS là một giải pháp quản lý phòng khám hiện đại, được xây dựng trên nền tảng Web với kiến trúc SaaS, giúp tối ưu hóa quy trình khám chữa bệnh, kê đơn thuốc và quản lý hồ sơ bệnh nhân một cách chuyên nghiệp và bảo mật.

## ✨ Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ thông tin cá nhân, tiền sử bệnh lý và theo dõi lịch sử khám bệnh chi tiết.
- **Kê đơn thuốc thông minh**: Giao diện kê đơn tối ưu, tích hợp công cụ tra cứu và tính liều lượng thuốc.
- **Tra cứu liều dùng AI**: Tích hợp Google Gemini AI với khả năng tra cứu Google Search thời gian thực để cung cấp thông tin liều dùng chính xác từ các nguồn y khoa uy tín.
- **Quản lý Kho thuốc**: Theo dõi danh mục thuốc, đơn giá, quy cách đóng gói và cảnh báo tồn kho tự động.
- **Dashboard trực quan**: Hệ thống báo cáo thống kê doanh thu, số lượng bệnh nhân theo thời gian thực.
- **Tối ưu hóa hiệu năng**: Áp dụng cơ chế Server-side Pagination và Caching dữ liệu giúp hệ thống hoạt động mượt mà ngay cả với dữ liệu lớn.

## 🚀 Công nghệ sử dụng

### Frontend & Backend
- **Framework**: Next.js 16 (App Router) - Tận dụng tối đa Server Components và Server Actions.
- **Giao diện**: React 19, Tailwind CSS 4, Framer Motion (hiệu ứng mượt mà).
- **Trạng thái & Validation**: React Hook Form kết hợp Zod cho kiểm soát dữ liệu chặt chẽ.
- **Hiệu năng**: Cơ chế `react cache` và Server Actions giúp giảm thiểu payload và tăng tốc độ phản hồi.

### Cơ sở dữ liệu & Bảo mật
- **Database**: PostgreSQL (qua nền tảng Supabase).
- **Xác thực**: Supabase Auth (JWT based).
- **Bảo mật dữ liệu**: Hệ thống chính sách **Row Level Security (RLS)** đảm bảo cách ly hoàn toàn dữ liệu giữa các phòng khám (Multi-tenancy).

### Trí tuệ nhân tạo (AI)
- **Model**: Google Gemini 2.5 Flash Lite.
- **Tính năng**: Sử dụng Grounding với Google Search để đảm bảo thông tin y tế luôn cập nhật.

## 📦 Cấu trúc thư mục

```text
├── src/
│   ├── actions/        # Server Actions (Xử lý nghiệp vụ phía Server)
│   ├── app/           # Next.js App Router (Giao diện & Tuyến đường)
│   ├── components/    # UI Components (Feature-based & Shared UI)
│   ├── contexts/      # React Contexts (Quản lý trạng thái client)
│   ├── hooks/         # Custom Hooks
│   ├── lib/           # Cấu hình Supabase, utils & helpers
│   ├── types/         # Định nghĩa kiểu dữ liệu TypeScript
├── supabase/          # Database migrations & SQL schema
├── .brain/            # Eternal Context (Lưu trữ tri thức hỗ trợ AI)
├── docs/              # Tài liệu hướng dẫn & Báo cáo Audit
└── tests/             # Hệ thống kiểm thử tự động (Vitest)
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
   Tạo file `.env.local` dựa trên mẫu `.env.example` và điền các thông tin cần thiết:
   - Supabase URL & Anon Key
   - Gemini API Keys (Hỗ trợ nhiều key cách nhau bằng dấu phẩy)

4. **Chạy dự án:**
   ```bash
   npm run dev
   ```

## 🛠️ Hướng dẫn sử dụng

1. **Đăng nhập**: Truy cập `/login` để vào hệ thống.
2. **Quản lý**: Sử dụng thanh điều hướng để quản lý Bệnh nhân hoặc Kho thuốc.
3. **Kê đơn**: Tại trang chi tiết bệnh nhân, sử dụng công cụ tạo đơn thuốc với sự hỗ trợ của AI để tra cứu liều dùng nhanh chóng.

## 🧪 Kiểm thử

Để đảm bảo hệ thống hoạt động ổn định, hãy chạy bộ kiểm thử:
```bash
npm test
```

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường
