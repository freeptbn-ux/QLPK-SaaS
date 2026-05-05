# QLPK SaaS - Hệ Thống Quản Lý Phòng Khám Hiện Đại

Phần mềm quản lý phòng khám (QLPK SaaS) là một giải pháp toàn diện giúp tự động hóa và tối ưu hóa quy trình hoạt động của phòng khám, bao gồm quản lý bệnh nhân, khám bệnh, kê đơn thuốc, và quản lý kho thuốc. Hệ thống được thiết kế với giao diện trực quan, thân thiện, và hiệu năng cao.

## Các tính năng chính

- **Quản lý bệnh nhân**: Thêm mới, tìm kiếm, xem hồ sơ, và quản lý thông tin bệnh nhân.
- **Khám bệnh & Kê đơn**: Hỗ trợ kê đơn thuốc nhanh chóng với tính năng tự động tìm kiếm thuốc, tính liều lượng, và kiểm tra tồn kho.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, cảnh báo thuốc sắp hết, và quản lý danh mục thuốc.
- **Thống kê & Báo cáo**: Cung cấp cái nhìn tổng quan về doanh thu và hoạt động của phòng khám.
- **Hệ thống Loading đồng bộ**: Trải nghiệm mượt mà, không giật lag nhờ hệ thống loading toàn cầu tiên tiến.
- **Hỗ trợ Dark Mode**: Giao diện sáng/tối thân thiện với mắt người dùng.

## Công nghệ sử dụng

Dự án được xây dựng dựa trên các công nghệ hiện đại và mạnh mẽ nhất:

- **Frontend**: Next.js (App Router), React, TypeScript.
- **Styling**: Tailwind CSS, CSS Modules.
- **Animations**: Framer Motion.
- **Backend & Database**: Supabase (PostgreSQL, Authentication).
- **Form Management & Validation**: React Hook Form, Zod.
- **Icons**: React Icons (Heroicons).

## Hướng dẫn cài đặt

Để chạy dự án trên môi trường local, vui lòng làm theo các bước sau:

### Yêu cầu hệ thống
- Node.js (phiên bản 18.x trở lên)
- npm, yarn, hoặc pnpm
- Tài khoản Supabase (để cấu hình Database và Auth)

### Các bước thực hiện

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   # hoặc
   yarn install
   # hoặc
   pnpm install
   ```

3. **Cấu hình biến môi trường**:
   - Tạo file `.env.local` ở thư mục gốc của dự án.
   - Thêm các biến môi trường cần thiết kết nối với Supabase:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Khởi chạy ứng dụng**:
   ```bash
   npm run dev
   # hoặc
   yarn dev
   # hoặc
   pnpm dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:3000`.

## Cấu trúc thư mục

- `src/app/`: Chứa các trang (pages) và layouts của ứng dụng (theo Next.js App Router).
- `src/components/`: Chứa các thành phần UI có thể tái sử dụng, bao gồm features (chức năng cụ thể), UI components cơ bản, và hệ thống Loading.
- `src/actions/`: Chứa các Server Actions để tương tác với cơ sở dữ liệu.
- `src/types/`: Định nghĩa các kiểu dữ liệu TypeScript.
- `src/lib/`: Chứa các tiện ích, cấu hình Supabase client, và logic validation.
- `plans/`: Chứa các tài liệu lên kế hoạch phát triển (development plans).

## Bản quyền và Giấy phép

Copyright 2026 Nguyễn Duy Trường.

Dự án này là tài sản trí tuệ thuộc về Nguyễn Duy Trường và không được phép sao chép, sử dụng hoặc phân phối khi chưa có sự đồng ý.
