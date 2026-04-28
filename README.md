# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
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
- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
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
   Tạo file `.env.local` tại thư mục gốc:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Khởi chạy môi trường phát triển:**
   ```bash
   npm run dev
   ```

## 📂 Cấu trúc dự án
- `src/app`: Routes và layouts của ứng dụng.
- `src/components`: Các thành phần giao diện (được chia theo feature-based).
- `src/actions`: Các hàm xử lý phía Server (Server Actions).
- `src/lib`: Cấu hình dùng chung, tiện ích và định nghĩa schemas.
- `supabase`: Quản lý migration và cấu hình database.
- `.brain`: Eternal Context - Lưu trữ kiến thức và lịch sử phát triển của dự án.

## ⚖️ Bản quyền
**Copyright 2026 Nguyễn Duy Trường**

---
*Sản phẩm được phát triển bởi Nguyễn Duy Trường với sự hỗ trợ từ Antigravity AI.*

