# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

## 🌟 Giới thiệu
**QLPK-SaaS** là một giải pháp phần mềm quản lý phòng khám hiện đại (SaaS), được thiết kế tối ưu để hỗ trợ các bác sĩ và nhân viên y tế trong việc quản lý bệnh nhân, kê đơn thuốc và theo dõi kho dược phẩm. Hệ thống được xây dựng với kiến trúc Multi-tenant, cho phép mỗi phòng khám quản lý dữ liệu riêng biệt một cách an toàn.

## 🚀 Tính năng chính
- **Quản lý bệnh nhân**: Lưu trữ hồ sơ chi tiết, tiểu sử bệnh lý và lịch sử khám bệnh.
- **Kê đơn thuốc thông minh**: Giao diện kê đơn trực quan, hỗ trợ tìm kiếm thuốc nhanh và tự động tính toán chi phí.
- **Quản lý dược phẩm & Tồn kho**: Theo dõi số lượng tồn kho theo thời gian thực, quản lý nhập/xuất thuốc và cảnh báo tồn kho.
- **Công cụ tính liều nhanh**: Hỗ trợ bác sĩ tính toán liều lượng thuốc dựa trên cân nặng cho bệnh nhi ngay tại màn hình kê đơn.
- **Báo cáo & Thống kê**: Biểu đồ trực quan về doanh thu, lượt khám và xu hướng bệnh tật.
- **Bảo mật Row Level Security (RLS)**: Đảm bảo dữ liệu của mỗi phòng khám hoàn toàn tách biệt và an toàn trên Supabase.

## 🛠️ Công nghệ sử dụng
Dự án sử dụng các công nghệ hiện đại nhất để đảm bảo hiệu suất và trải nghiệm người dùng:
- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI/UX**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS, SSR)
- **Validation**: [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/)
- **Visuals**: [Recharts](https://recharts.org/) (Thống kê), [React Icons](https://react-icons.github.io/react-icons/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Utilities**: Dayjs, Lodash, clsx, tailwind-merge

## 📦 Hướng dẫn cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env.local` tại thư mục gốc và điền các thông tin từ Supabase Project của bạn:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

## 📂 Cấu trúc thư mục tiêu biểu
- `src/app`: Hệ thống routes (Authentication, Dashboard, Patients, Medicines, Statistics).
- `src/components/features`: Các component chuyên biệt theo tính năng (quản lý bệnh nhân, đơn thuốc, kho thuốc).
- `src/actions`: Các Server Actions xử lý logic backend và Database.
- `src/lib`: Chứa utils (xử lý tuổi, format ngày tháng), Supabase client và schemas validation.
- `supabase`: Các script migrations và định nghĩa database schema.
- `.brain`: Eternal Context - Lưu trữ lịch sử phát triển, quyết định thiết kế và kiến thức dự án.

## ⚖️ Bản quyền
Copyright 2026 Nguyễn Duy Trường

---
*Phát triển bởi Nguyễn Duy Trường với sự hỗ trợ của Antigravity AI.*
