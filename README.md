# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

## 🌟 Giới thiệu
**QLPK-SaaS** là một giải pháp phần mềm quản lý phòng khám hiện đại dưới dạng dịch vụ (SaaS). Được thiết kế với giao diện cao cấp, mượt mà và tối ưu hóa cho hiệu suất làm việc của bác sĩ, hệ thống giúp đơn giản hóa mọi quy trình từ quản lý bệnh nhân đến kê đơn và kiểm soát kho dược phẩm.

Dự án sử dụng kiến trúc **Multi-tenant** mạnh mẽ, đảm bảo tính biệt lập và bảo mật dữ liệu tuyệt đối giữa các phòng khám thông qua cơ chế **PostgreSQL Row Level Security (RLS)**.

## 🚀 Tính năng nổi bật
- **Dashboard Phân Tích**: Theo dõi chỉ số quan trọng, doanh thu và lưu lượng bệnh nhân thông qua biểu đồ trực quan.
- **Quản lý Bệnh Nhân**: Hồ sơ điện tử chi tiết, tra cứu lịch sử khám bệnh và tiểu sử bệnh lý chỉ trong vài giây.
- **Kê Đơn Thông Minh**: Hệ thống tìm kiếm thuốc thông minh, hỗ trợ tính liều lượng theo cân nặng và tự động tính toán tổng chi phí.
- **Kiểm Soát Tồn Kho**: Quản lý xuất/nhập thuốc theo thời gian thực, cảnh báo khi thuốc sắp hết hạn hoặc dưới ngưỡng an toàn.
- **Công Cụ Hỗ Trợ Lâm Sàng**: Tích hợp máy tính liều lượng thuốc (Dose Calculator) ngay tại màn hình làm việc.
- **Trải Nghiệm Premium**: Giao diện Modern SaaS với hiệu ứng chuyển cảnh mượt mà, hỗ trợ tốt trên cả thiết bị di động.

## 🛠️ Công nghệ sử dụng
Hệ thống được xây dựng trên nền tảng các công nghệ tiên tiến nhất hiện nay:
- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animation)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Postgres, Row Level Security, Edge Functions)
- **Data Flow**: [Zod](https://zod.dev/) (Validation), [React Hook Form](https://react-hook-form.com/)
- **Visualization**: [Recharts](https://recharts.org/)
- **Quality Assurance**: [Vitest](https://vitest.dev/) (Unit & Integration Testing)

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

3. **Cấu hình môi trường:**
   Tạo file `.env.local` tại thư mục gốc và điền các thông tin từ dự án Supabase của bạn:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Khởi chạy môi trường phát triển:**
   ```bash
   npm run dev
   ```
   Truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📖 Cách sử dụng
- **Đăng nhập**: Sử dụng tài khoản bác sĩ/quản trị viên được cấp quyền.
- **Quản lý bệnh nhân**: Truy cập mục "Bệnh nhân" để thêm mới hoặc tra cứu hồ sơ.
- **Khám bệnh**: Chọn bệnh nhân và nhấn "Khám bệnh" để bắt đầu kê đơn và ghi chú lâm sàng.
- **Thống kê**: Xem báo cáo doanh thu và hoạt động phòng khám tại mục "Thống kê".

## 📂 Cấu trúc dự án
- `src/app`: Cấu trúc routing (App Router), Layouts và Pages.
- `src/components`: Thư viện components UI dùng chung và các components theo tính năng.
- `src/actions`: Chứa các Server Actions để tương tác với database.
- `src/lib`: Các tiện ích, cấu hình Supabase và định nghĩa dữ liệu (Zod schemas).
- `supabase`: Chứa các file SQL migration và cấu hình liên quan đến database.
- `.brain`: Eternal Context - Lưu trữ toàn bộ tri thức, kế hoạch và lịch sử phát triển của dự án giúp AI hiểu ngữ cảnh sâu.

## ⚖️ Bản quyền
Copyright 2026 Nguyễn Duy Trường

---
*Dự án được xây dựng với tiêu chuẩn UI/UX cao cấp, tập trung vào trải nghiệm người dùng cuối.*
