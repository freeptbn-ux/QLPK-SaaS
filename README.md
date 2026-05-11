# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB-green?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)

QLPK-SaaS là một giải pháp quản lý phòng khám hiện đại, được xây dựng trên nền tảng Web với kiến trúc SaaS (Software as a Service). Hệ thống giúp tối ưu hóa toàn bộ quy trình vận hành của phòng khám từ khâu tiếp đón bệnh nhân, kê đơn thuốc đến quản lý kho dược và báo cáo tài chính.

## ✨ Tính năng chính

- **Quản lý Bệnh nhân**: Hồ sơ bệnh nhân tập trung, lưu trữ tiền sử bệnh lý, chẩn đoán và lịch sử khám chữa bệnh chi tiết.
- **Hệ thống Kê đơn Thông minh**: Giao diện kê đơn mượt mà, hỗ trợ tính toán tổng tiền tự động và kiểm tra tính hợp lệ của đơn thuốc.
- **Tra cứu liều dùng AI**: Tích hợp Google Gemini AI giúp bác sĩ tra cứu liều dùng, tương tác thuốc từ các nguồn y khoa uy tín thông qua Google Search thời gian thực.
- **Quản lý Kho thuốc**: Theo dõi tồn kho theo thời gian thực, quản lý đơn giá, quy cách đóng gói và cảnh báo khi thuốc sắp hết.
- **Quản lý Đa phòng khám (Multi-tenancy)**: Kiến trúc SaaS cho phép nhiều phòng khám sử dụng chung một hệ thống nhưng dữ liệu hoàn toàn tách biệt và bảo mật thông qua Row Level Security (RLS).
- **Báo cáo & Thống kê**: Dashboard trực quan cung cấp số liệu về doanh thu, số lượng bệnh nhân và hiệu suất hoạt động của phòng khám.

## 🚀 Công nghệ sử dụng

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion.
- **Backend**: Next.js Server Actions, Supabase (PostgreSQL).
- **Xác thực**: Supabase Auth (JWT).
- **AI Integration**: Google Gemini SDK (Gemini 2.5 Flash-Lite).
- **Testing**: Vitest, Playwright.
- **Khác**: Zod, React Hook Form, Recharts, React Icons.

## 📦 Cấu trúc thư mục chính

```text
├── src/
│   ├── actions/        # Server Actions xử lý logic nghiệp vụ
│   ├── app/           # Cấu trúc App Router của Next.js
│   ├── components/    # Các thành phần giao diện (UI Components)
│   ├── contexts/      # Quản lý trạng thái Client (Context API)
│   ├── hooks/         # Custom React Hooks
│   ├── lib/           # Cấu hình thư viện (Supabase client, utils...)
│   └── types/         # Định nghĩa kiểu dữ liệu TypeScript
├── supabase/          # Database Schema, Migrations & Seed data
├── .brain/            # Eternal Context (Tri thức hỗ trợ AI agent - Antigravity)
├── plans/             # Kế hoạch phát triển và gia cố bảo mật
├── tests/             # Các kịch bản kiểm thử tự động
└── scripts/           # Các script hỗ trợ vận hành và bảo trì
```

## 🛠️ Hướng dẫn cài đặt

1. **Clone dự án**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**:
   Tạo file `.env` từ mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Điền đầy đủ thông tin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DB_PASSWORD` (Cho việc chạy migration/scripts)
   - `GEMINI_API_KEY` (Cho tính năng tra cứu AI)

4. **Khởi chạy dự án**:
   ```bash
   npm run dev
   ```

## 🛡️ Bảo mật

Hệ thống áp dụng các tiêu chuẩn bảo mật nghiêm ngặt:
- **Tenant Isolation**: Sử dụng RLS (Row Level Security) của PostgreSQL để đảm bảo cách ly dữ liệu tuyệt đối giữa các phòng khám.
- **Environment Safety**: Tuyệt đối không lưu trữ API Key trong mã nguồn. Sử dụng biến môi trường được quản lý chặt chẽ.
- **Default Deny Policy**: Áp dụng cơ chế "Từ chối mặc định" đối với các role chưa được xác thực.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường
