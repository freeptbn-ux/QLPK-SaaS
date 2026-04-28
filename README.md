# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

## 🌟 Giới thiệu
**QLPK-SaaS** là một giải pháp phần mềm quản lý phòng khám hiện đại (SaaS), được thiết kế tối ưu để hỗ trợ các bác sĩ và nhân viên y tế trong việc quản lý bệnh nhân, kê đơn thuốc và theo dõi kho dược phẩm. Đặc biệt, hệ thống tích hợp các công cụ hỗ trợ nhi khoa giúp tính toán liều lượng thuốc chính xác và nhanh chóng.

## 🚀 Tính năng chính
- **Quản lý bệnh nhân**: Theo dõi hồ sơ chi tiết, tiểu sử bệnh lý và lịch sử khám bệnh.
- **Kê đơn thuốc thông minh**: Giao diện kê đơn trực quan, hỗ trợ tìm kiếm thuốc nhanh và tự động tính tổng tiền.
- **Công cụ tính liều nhanh**: Tích hợp ngay trong màn hình kê đơn, hỗ trợ bác sĩ tính liều thuốc dựa trên cân nặng (mg/kg) cho bệnh nhi.
- **Quản lý dược phẩm & Tồn kho**: Theo dõi số lượng tồn kho, cảnh báo thuốc sắp hết và quản lý quy cách đóng gói.
- **Báo cáo & Thống kê**: Biểu đồ trực quan về doanh thu, số lượng bệnh nhân và hiệu suất phòng khám.
- **Giao diện hiện đại**: Hỗ trợ Dark Mode, thiết kế Responsive mượt mà trên mọi thiết bị.

## 🛠️ Công nghệ sử dụng
Hệ thống được xây dựng trên những công nghệ web mạnh mẽ nhất hiện nay:
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animation)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Biểu đồ**: [Recharts](https://recharts.org/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)

## 📦 Hướng dẫn cài đặt

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
   Tạo file `.env.local` tại thư mục gốc và cấu hình các thông số Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Khởi chạy môi trường phát triển:**
   ```bash
   npm run dev
   ```
   Truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📂 Cấu trúc thư mục tiêu biểu
- `src/app`: Chứa các routes và các trang chức năng.
- `src/components/features`: Các component chuyên biệt cho từng tính năng (Bệnh nhân, Thuốc, Kê đơn...).
- `src/actions`: Các Server Actions để giao tiếp với database.
- `src/lib`: Chứa các hàm tiện ích, cấu hình database và validation schema.
- `supabase/migrations`: Các bản ghi thay đổi cấu trúc database.
- `.brain`: Thư mục lưu trữ kiến thức và ngữ cảnh cho AI.

## ⚖️ Bản quyền
Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển với sự hỗ trợ của Antigravity AI.*
