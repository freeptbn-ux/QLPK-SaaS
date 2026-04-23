# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

QLPK-SaaS là giải pháp quản lý phòng khám hiện đại được xây dựng dưới dạng phần mềm dịch vụ (SaaS). Hệ thống giúp tối ưu hóa quy trình quản lý bệnh nhân, kho thuốc, kê đơn và theo dõi doanh thu một cách hiệu quả, chuyên nghiệp.

## 🚀 Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ hồ sơ bệnh lý, tiểu sử và thông tin liên lạc của bệnh nhân.
- **Quản lý Thuốc & Kho**: Theo dõi số lượng tồn kho, cảnh báo thuốc sắp hết, quản lý đơn giá và quy cách đóng gói.
- **Hệ thống Kê đơn**: Quy trình kê đơn nhanh chóng, tự động tính toán tổng chi phí và in đơn thuốc chuyên nghiệp.
- **Công cụ Tính liều lượng**: Hỗ trợ bác sĩ tính toán liều lượng thuốc dựa trên cân nặng và các thông số lâm sàng.
- **Báo cáo & Thống kê**: Biểu đồ trực quan về lượt khám, doanh thu và mức độ tiêu thụ thuốc theo thời gian.
- **Giao diện Hiện đại**: Hỗ trợ chế độ Sáng/Tối (Dark Mode) và tương thích hoàn toàn với các thiết bị di động.

## 🛠️ Công nghệ sử dụng

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [Material UI (MUI) v9](https://mui.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Postgres, Auth, Edge Functions)
- **State Management**: React Hook Form + Zod (Validation)
- **Charts**: Recharts
- **Styling**: Emotion (CSS-in-JS)
- **Ngôn ngữ**: TypeScript

## 📦 Cấu trúc thư mục

```text
.
├── src/
│   ├── actions/      # Server Actions xử lý logic nghiệp vụ
│   ├── app/          # App Router (Pages, Layouts)
│   ├── components/   # Các UI Components dùng chung
│   ├── hooks/        # Custom React Hooks
│   ├── lib/          # Cấu hình Supabase, utils
│   ├── theme/        # Cấu hình MUI Theme (Light/Dark mode)
│   └── types/        # TypeScript Definitions
├── supabase/
│   └── migrations/   # File SQL khởi tạo và cập nhật database
├── public/           # Assets tĩnh (images, icons)
└── plans/            # Tài liệu kế hoạch phát triển dự án
```

## ⚙️ Cài đặt

1. **Clone repository**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**:
   Tạo file `.env.local` từ mẫu `.env.example` và điền thông tin Supabase của bạn:
   ```text
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Chạy dự án ở chế độ phát triển**:
   ```bash
   npm run dev
   ```

5. **Build cho production**:
   ```bash
   npm run build
   npm start
   ```

## 📝 Cách sử dụng

- Đăng nhập vào hệ thống bằng tài khoản được cấp.
- Sử dụng Sidebar để chuyển đổi giữa các module: Bệnh nhân, Thuốc, Thống kê, v.v.
- Hệ thống tự động lưu trữ và đồng bộ hóa dữ liệu thời gian thực thông qua Supabase.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển bởi Nguyễn Duy Trường.*
