# QLPK SaaS - Hệ Thống Quản Lý Phòng Khám Hiện Đại

Phần mềm quản lý phòng khám (QLPK SaaS) là một giải pháp toàn diện giúp tự động hóa và tối ưu hóa quy trình hoạt động của phòng khám, bao gồm quản lý bệnh nhân, khám bệnh, kê đơn thuốc, và quản lý kho thuốc. Hệ thống được thiết kế với giao diện trực quan, thân thiện, và hiệu năng cao.

## 🚀 Các tính năng chính

- **Quản lý bệnh nhân**: Thêm mới, tìm kiếm, xem hồ sơ, và quản lý thông tin bệnh nhân chi tiết.
- **Khám bệnh & Kê đơn**: Hỗ trợ quy trình khám bệnh khép kín, kê đơn thuốc nhanh chóng với tính năng tự động tìm kiếm, tính liều lượng và kiểm tra tồn kho thời gian thực.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, cảnh báo thuốc sắp hết, quản lý danh mục thuốc và lịch sử điều chỉnh kho.
- **Thống kê & Báo cáo**: Cung cấp cái nhìn tổng quan về doanh thu, lượt khám, cơ cấu giới tính và nhóm tuổi của bệnh nhân.
- **Hệ thống Loading đồng bộ**: Trải nghiệm người dùng mượt mà với hệ thống loading toàn cầu (Global Loading) và các hiệu ứng chuyển cảnh cao cấp.
- **Hỗ trợ Dark Mode**: Giao diện tối/sáng linh hoạt, tối ưu cho sự thoải mái của người dùng trong nhiều môi trường làm việc.

## 🛠 Công nghệ sử dụng

Dự án được xây dựng dựa trên các công nghệ hiện đại và mạnh mẽ:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/).
- **Cơ sở dữ liệu & Auth**: [Supabase](https://supabase.com/) (PostgreSQL).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/).
- **Animations**: [Framer Motion](https://www.framer.com/motion/).
- **Biểu đồ**: [Recharts](https://recharts.org/).
- **Quản lý Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/).
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## 📦 Hướng dẫn cài đặt

Để triển khai dự án trên môi trường local, hãy thực hiện theo các bước sau:

### Yêu cầu hệ thống
- Node.js (phiên bản 18.x trở lên)
- npm, yarn, hoặc pnpm
- Tài khoản Supabase để cấu hình Database và Authentication.

### Các bước thực hiện

1. **Clone repository**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   # hoặc
   pnpm install
   ```

3. **Cấu hình biến môi trường**:
   - Tạo file `.env.local` ở thư mục gốc.
   - Copy nội dung từ `.env.example` và điền thông tin Supabase của bạn:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Khởi chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   Truy cập tại: `http://localhost:3000`.

## 📂 Cấu trúc thư mục

```text
QLPK-SaaS/
├── src/
│   ├── app/          # Pages & Layouts (App Router)
│   ├── components/   # UI & Feature Components
│   ├── actions/      # Server Actions (Logic Backend)
│   ├── lib/          # Utilities, Config & Validation
│   ├── types/        # TypeScript Definitions
│   └── styles/       # Global CSS & Tailwind Config
├── supabase/         # Database migrations & RPCs
├── public/           # Static assets
├── tests/            # Unit & Integration tests
├── plans/            # Tài liệu kế hoạch phát triển
└── docs/             # Tài liệu hướng dẫn & Specs
```

## 📝 Thông tin bổ sung

- Hệ thống sử dụng **Supabase RPC** cho các logic thống kê phức tạp để tối ưu hiệu năng.
- Toàn bộ dữ liệu được bảo mật bằng hệ thống **Row Level Security (RLS)** của PostgreSQL.
- Dự án hỗ trợ tích hợp tốt với các môi trường CI/CD như Vercel.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường.

Mọi quyền được bảo lưu. Dự án này là tài sản trí tuệ thuộc về Nguyễn Duy Trường. Việc sao chép, phân phối hoặc sử dụng trái phép mã nguồn này bị nghiêm cấm.
