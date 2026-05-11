# QLPK-SaaS - Hệ thống Quản lý Phòng khám Hiện đại

QLPK-SaaS là một giải pháp phần mềm quản lý phòng khám (Clinic Management System) hiện đại, được xây dựng trên mô hình SaaS (Software as a Service). Dự án tập trung vào việc tối ưu hóa quy trình làm việc của bác sĩ, quản lý hồ sơ bệnh nhân, kê đơn thuốc và theo dõi doanh thu một cách hiệu quả nhất.

## 🚀 Công nghệ Sử dụng

Dự án sử dụng các công nghệ tiên tiến nhất để đảm bảo hiệu năng và khả năng mở rộng:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Ngôn ngữ**: TypeScript
- **Cơ sở dữ liệu & Xác thực**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Quản lý trạng thái**: React Hooks & Server Actions (Zero-JS client logic where possible)
- **Kiểm thử**: Vitest (Unit/Integration) & Playwright (E2E)
- **Hiệu năng**: Tối ưu hóa truy vấn với Rollup tables và Database Functions (RPC)

## ✨ Tính năng Chính

1.  **Quản lý Bệnh nhân**:
    - Lưu trữ hồ sơ bệnh nhân chi tiết.
    - Truy xuất lịch sử khám bệnh và kê đơn nhanh chóng.
2.  **Kê đơn & Quản lý Thuốc**:
    - Quy trình kê đơn thuốc thông minh.
    - Tự động trừ tồn kho khi xuất đơn.
    - Cảnh báo thuốc sắp hết hạn hoặc dưới mức tối thiểu.
3.  **Thống kê & Báo cáo**:
    - Biểu đồ doanh thu và lượt khám theo ngày/tuần/tháng/năm.
    - Tối ưu hóa tốc độ tải với bảng thống kê cộng dồn (`clinic_daily_stats`).
4.  **Công cụ Hỗ trợ**:
    - Máy tính liều lượng thuốc (Dose Calculator).
    - Tìm kiếm bệnh nhân theo tên, số điện thoại hoặc CCCD.
5.  **Cấu hình Hệ thống**:
    - Quản lý thông tin phòng khám, biểu mẫu in ấn.

## 🛠 Hướng dẫn Cài đặt

### Yêu cầu hệ thống
- Node.js 18.x trở lên
- Tài khoản Supabase

### Các bước cài đặt

1.  **Clone dự án**:
    ```bash
    git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
    cd QLPK-SaaS
    ```

2.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường**:
    Tạo file `.env` từ `.env.example` và điền thông tin Supabase của bạn:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```

4.  **Khởi tạo Database**:
    Sử dụng các file trong thư mục `supabase/migrations` để thiết lập bảng và functions trong Supabase SQL Editor.

5.  **Chạy dự án ở chế độ phát triển**:
    ```bash
    npm run dev
    ```

## 📁 Cấu trúc Thư mục

- `src/app`: Chứa các route, layouts và pages (Next.js App Router).
- `src/actions`: Các Server Actions để tương tác với Supabase.
- `src/components`: Các component UI dùng chung và component theo tính năng.
- `src/lib`: Cấu hình Supabase client, utils và các thư viện bổ trợ.
- `src/types`: Định nghĩa các interface và type cho TypeScript.
- `supabase`: Chứa mã nguồn SQL cho database, chính sách RLS và functions.

## 📝 Thông tin Bổ sung

Dự án này được thiết kế với tư duy **Performance First**:
- Sử dụng `React.cache()` để tránh duplicate queries.
- Triển khai RLS (Row Level Security) chặt chẽ để bảo mật dữ liệu giữa các phòng khám.
- Tận dụng Postgres Triggers để tự động cập nhật thống kê.

---

**Copyright 2026 Nguyễn Duy Trường**
