# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🌟 Giới thiệu
**QLPK-SaaS** là một nền tảng quản lý phòng khám hiện đại (Software as a Service) được thiết kế để tối ưu hóa quy trình làm việc của bác sĩ và nhân viên y tế. Với giao diện cao cấp, hiệu suất vượt trội và tính năng bảo mật hàng đầu, hệ thống mang đến trải nghiệm làm việc chuyên nghiệp và hiệu quả.

Dự án được xây dựng với kiến trúc **Multi-tenant**, sử dụng cơ chế **PostgreSQL Row Level Security (RLS)** để đảm bảo mỗi phòng khám đều có môi trường dữ liệu biệt lập và an toàn tuyệt đối.

## 🚀 Tính năng nổi bật
- **📊 Dashboard Phân Tích**: Theo dõi sức khỏe phòng khám qua các chỉ số doanh thu, lưu lượng bệnh nhân và thống kê sử dụng thuốc theo thời gian thực.
- **👤 Quản lý Bệnh Nhân**: Hồ sơ bệnh nhân chi tiết, lưu trữ lịch sử khám bệnh, tiểu sử bệnh lý và các chỉ số sinh tồn (cân nặng, huyết áp...).
- **💊 Kê Đơn Thông Minh**: Tìm kiếm thuốc nhanh chóng, tự động tính toán liều lượng dựa trên cân nặng và đồng bộ hóa với kho dược.
- **📦 Quản lý Dược Phẩm**: Kiểm soát nhập/xuất kho, theo dõi hạn sử dụng và cảnh báo tồn kho an toàn.
- **⚖️ Dose Calculator**: Công cụ hỗ trợ tính liều thuốc nhi khoa và lâm sàng tích hợp ngay trên giao diện kê đơn.
- **✨ Trải Nghiệm Premium**: Giao diện Modern SaaS, hỗ trợ Dark Mode, hiệu ứng Framer Motion mượt mà và tối ưu hoàn toàn cho di động.

## 🛠️ Công nghệ sử dụng
- **Core Framework**: [Next.js 16.2](https://nextjs.org/) (App Router, Server Actions)
- **Frontend**: [React 19.2](https://react.dev/), [Tailwind CSS 4.2](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Postgres, RLS, Storage)
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/)

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
   Tạo file `.env.local` tại thư mục gốc và điền thông tin từ Supabase Project của bạn:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Khởi chạy Development Server:**
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt của bạn.

## 📂 Cấu trúc thư mục
- `src/app`: Routes, Layouts và Pages (Next.js App Router).
- `src/components`: UI Components (Common & Features).
- `src/actions`: Server Actions xử lý logic nghiệp vụ và DB.
- `src/lib`: Cấu hình SDK, Utils và Zod Validation.
- `supabase`: Database Migrations, Seed data và RLS Policies.
- `.brain`: **Eternal Context** - Lưu trữ tri thức phát triển của dự án (Chỉ dành cho AI Agent).

## ⚖️ Bản quyền
Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển với sự chú trọng tối đa vào tính tiện dụng và thẩm mỹ.*
