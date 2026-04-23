# Quản Lý Phòng Khám Nhi (QLPK-SaaS) 🏥

Phần mềm quản lý phòng khám nhi khoa hiện đại, được xây dựng dưới dạng mô hình SaaS (Software as a Service) giúp các bác sĩ quản lý bệnh nhân, đơn thuốc và thống kê phòng khám một cách chuyên nghiệp và hiệu quả.

## 🚀 Tính năng chính

- **Quản lý bệnh nhân:** Lưu trữ hồ sơ, tiền sử bệnh án, thông tin liên lạc và ngày sinh (định dạng chuẩn DD/MM/YYYY).
- **Tính toán tuổi thông minh:** Tự động hiển thị tuổi theo ngày, tuần, tháng hoặc năm tùy theo độ tuổi của bé, hỗ trợ bác sĩ nhi khoa tối ưu.
- **Quản lý thuốc & Kho:** Theo dõi tồn kho, quy cách đóng gói và cảnh báo khi thuốc sắp hết.
- **Kê đơn thuốc thông minh:** Tự động tính toán liều lượng, tích hợp lịch sử dùng thuốc của bệnh nhân và trừ tồn kho tự động.
- **Máy tính liều lượng (Dose Calculator):** Hỗ trợ tính liều thuốc dựa trên cân nặng và các thông số lâm sàng.
- **Thống kê & Báo cáo:** Biểu đồ doanh thu, lượt khám và phân bố nhóm tuổi bệnh nhân trực quan.
- **Cài đặt phòng khám:** Tùy chỉnh thông tin phòng khám, biểu phí khám bệnh và giao diện người dùng (Light/Dark Mode).

## 🛠️ Công nghệ sử dụng

Dự án được xây dựng trên nền tảng công nghệ tiên tiến nhất:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library:** [Material UI v9](https://mui.com/) (MUI) - Giao diện hiện đại, responsive cao.
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) - Đảm bảo tính chặt chẽ và an toàn cho mã nguồn.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, SSR, Edge Functions).
- **Quản lý Form:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) cho việc xác thực dữ liệu.
- **Biểu đồ:** [Recharts](https://recharts.org/).
- **Xử lý thời gian:** [Day.js](https://day.js.org/).
- **Kiểm thử:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/).

## 📦 Cấu trúc thư mục chính

```text
src/
├── actions/        # Server Actions xử lý logic database (Supabase)
├── app/            # Cấu trúc routing (Auth, Dashboard, Patients...)
├── components/     # Các UI components (features, ui shared)
├── hooks/          # Custom hooks (Toast, Theme, Auth...)
├── lib/            # Cấu hình thư viện, utils và validation schemas
├── theme/          # Cấu hình Material UI Theme
└── types/          # Định nghĩa kiểu dữ liệu TypeScript
plans/              # Tài liệu kế hoạch triển khai các giai đoạn
scripts/            # Các script migration và hỗ trợ database
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
   Tạo file `.env.local` từ `.env.example` và điền các thông tin từ dự án Supabase của bạn:
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

- Đăng nhập bằng tài khoản bác sĩ đã được cấp thông qua hệ thống Supabase Auth.
- Sử dụng Sidebar để chuyển đổi giữa các module:
  - **Bệnh nhân:** Quản lý thông tin, tìm kiếm và xem lịch sử khám.
  - **Kê đơn:** Tạo đơn thuốc mới nhanh chóng với gợi ý liều lượng.
  - **Thống kê:** Theo dõi hiệu quả hoạt động của phòng khám qua các biểu đồ.
  - **Máy tính liều:** Công cụ hỗ trợ tính toán liều lượng thuốc nhi khoa.
- Hệ thống hỗ trợ phím tắt và giao diện tối ưu cho cả máy tính và thiết bị di động.

## 🛡️ Bản quyền

Copyright © 2026 Nguyễn Duy Trường

---
*Dự án này được phát triển nhằm mục đích cung cấp giải pháp quản lý chuyên sâu cho các phòng khám nhi khoa hiện đại.*
