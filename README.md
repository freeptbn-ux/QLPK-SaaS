# QLPK-SaaS - Hệ thống Quản lý Phòng khám Hiện đại

QLPK-SaaS là một giải pháp phần mềm quản lý phòng khám (Clinic Management System) hiện đại, được xây dựng trên mô hình SaaS (Software as a Service). Dự án tập trung vào việc tối ưu hóa quy trình làm việc của bác sĩ, quản lý hồ sơ bệnh nhân, kê đơn thuốc và theo dõi doanh thu một cách hiệu quả nhất.

## 🚀 Công nghệ Sử dụng

Dự án sử dụng các công nghệ tiên tiến nhất để đảm bảo hiệu năng và khả năng mở rộng:

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Cơ sở dữ liệu & Xác thực**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Kiểm thử**: [Vitest](https://vitest.dev/)
- **Performance**: Tối ưu hóa với Rollup tables (`clinic_daily_stats`) và Postgres Triggers.

## ✨ Tính năng Chính

1.  **Quản lý Bệnh nhân**:
    - Lưu trữ hồ sơ bệnh nhân chi tiết (họ tên, ngày sinh, địa chỉ, lịch sử khám).
    - Tìm kiếm bệnh nhân thông minh theo tên hoặc số điện thoại.
2.  **Kê đơn & Quản lý Thuốc**:
    - Quy trình kê đơn thuốc nhanh chóng, trực quan.
    - Tự động trừ tồn kho và cảnh báo khi thuốc sắp hết.
3.  **Thống kê & Báo cáo (Dashboard)**:
    - Thống kê doanh thu, lượt khám theo ngày/tuần/tháng.
    - Biểu đồ trực quan giúp theo dõi tình hình kinh doanh của phòng khám.
4.  **Bảo mật Đa người dùng (SaaS)**:
    - Cơ chế RLS (Row Level Security) đảm bảo mỗi phòng khám chỉ thấy dữ liệu của chính mình.
    - Phân quyền người dùng chặt chẽ qua Supabase Auth.

## 🛠 Hướng dẫn Cài đặt

### Yêu cầu hệ thống
- **Node.js**: 18.x hoặc mới hơn
- **npm**: 9.x hoặc mới hơn

### Các bước thực hiện

1.  **Clone dự án**:
    ```bash
    git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
    cd QLPK-SaaS
    ```

2.  **Cài đặt thư viện**:
    ```bash
    npm install
    ```

3.  **Cấu hình môi trường**:
    Sao chép file `.env.example` thành `.env`:
    ```bash
    cp .env.example .env
    ```
    Điền các thông tin `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` từ dự án Supabase của bạn.

4.  **Khởi tạo Database**:
    Chạy các file migration trong thư mục `supabase/migrations` vào SQL Editor của Supabase.

5.  **Chạy dự án**:
    ```bash
    npm run dev
    ```
    Truy cập tại: [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc Thư mục

- `src/app`: Routes, layouts và pages (App Router).
- `src/actions`: Các Server Actions thực hiện logic nghiệp vụ phía server.
- `src/components`: UI components (Shared, Layout, Feature-based).
- `src/lib`: Supabase client, helpers và utilities.
- `src/hooks`: Custom React hooks (useDebounce, useMediaQuery, ...).
- `src/types`: Định nghĩa các kiểu dữ liệu TypeScript.
- `supabase`: Schema, migrations, triggers và functions.
- `public`: Tài nguyên tĩnh (images, icons).

## 📝 Thông tin Bổ sung

- Dự án tuân thủ nghiêm ngặt các quy tắc về bảo mật dữ liệu y tế.
- Hệ thống hỗ trợ in đơn thuốc ra file PDF hoặc máy in nhiệt.

---

**Copyright 2026 Nguyễn Duy Trường**
