# Quản Lý Phòng Khám Nhi (QLPK-SaaS) 🏥

Phần mềm quản lý phòng khám nhi khoa hiện đại, được xây dựng dưới dạng mô hình SaaS (Software as a Service) giúp các bác sĩ quản lý bệnh nhân, đơn thuốc và thống kê phòng khám một cách chuyên nghiệp và hiệu quả.

## 🚀 Tính năng chính

- **Quản lý bệnh nhân:** Lưu trữ hồ sơ, tiền sử bệnh án, thông tin liên lạc và cân nặng của bé.
- **Quản lý thuốc & Kho:** Theo dõi tồn kho, quy cách đóng gói và cảnh báo khi thuốc sắp hết.
- **Kê đơn thuốc thông minh:** Tự động tính toán liều lượng, tích hợp lịch sử dùng thuốc và trừ tồn kho tự động.
- **Máy tính liều lượng (Dose Calculator):** Hỗ trợ tính liều thuốc dựa trên cân nặng và độ tuổi của bé.
- **Thống kê & Báo cáo:** Biểu đồ doanh thu, lượt khám và xu hướng sử dụng thuốc trực quan.
- **Cài đặt phòng khám:** Tùy chỉnh thông tin phòng khám, biểu phí khám bệnh và giao diện (Light/Dark Mode).

## 🛠️ Công nghệ sử dụng

Dự án được xây dựng trên nền tảng công nghệ tiên tiến nhất năm 2026:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library:** [Material UI v9](https://mui.com/) (MUI) - Giao diện hiện đại, responsive.
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) - Đảm bảo tính chặt chẽ và an toàn cho mã nguồn.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, SSR).
- **Quản lý Form:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/).
- **Biểu đồ:** [Recharts](https://recharts.org/).
- **Xử lý thời gian:** [Day.js](https://day.js.org/).

## 📦 Cấu trúc thư mục

```text
src/
├── actions/        # Server Actions xử lý logic database (Supabase)
├── app/            # Cấu trúc routing (Auth, Dashboard, Pages)
├── components/     # Các UI components (theo tính năng và dùng chung)
├── hooks/          # Custom hooks (Toast, Theme...)
├── lib/            # Cấu hình thư viện và validation schemas
├── theme/          # Cấu hình giao diện (ThemeRegistry, ThemeContext)
└── types/          # Định nghĩa kiểu dữ liệu (TypeScript Interfaces)
```

## ⚙️ Hướng dẫn cài đặt

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
   Tạo file `.env.local` từ `.env.example` và điền các thông tin từ Supabase Project của bạn:
   ```text
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Chạy ứng dụng ở chế độ phát triển:**
   ```bash
   npm run dev
   ```

5. **Build cho môi trường Production:**
   ```bash
   npm run build
   npm start
   ```

## 📝 Cách sử dụng

- Đăng nhập bằng tài khoản bác sĩ đã được cấp.
- Sử dụng Sidebar để chuyển đổi giữa các module: Bệnh nhân, Thuốc, Thống kê, Máy tính liều.
- Trong module Bệnh nhân, bạn có thể xem chi tiết lịch sử khám và kê đơn thuốc mới.
- Hệ thống tự động lưu trữ và đồng bộ hóa dữ liệu lên Cloud (Supabase).

## 🛡️ Bản quyền

Copyright © 2026 Nguyễn Duy Trường

---
*Ghi chú: Dự án này được phát triển để phục vụ công tác quản lý phòng khám nhi khoa chuyên sâu.*
