# QLPK SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

Hệ thống quản lý phòng khám (QLPK SaaS) là một giải pháp toàn diện được thiết kế để tối ưu hóa quy trình khám chữa bệnh. Dự án tập trung vào việc quản lý bệnh nhân, kê đơn thuốc thông minh với tính năng tính liều lượng tự động, và theo dõi thống kê phòng khám một cách trực quan.

## 🚀 Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ thông tin chi tiết, lịch sử khám bệnh và các chỉ số sinh tồn.
- **Kê đơn thuốc thông minh**: 
  - Tự động tính liều lượng dựa trên cân nặng và độ tuổi.
  - Gợi ý thuốc từ danh mục sẵn có.
  - Quản lý đơn giá và thành tiền tự động (đã khóa chỉnh sửa đơn giá tại quầy để đảm bảo tính nhất quán).
- **Dashboard Thống kê**: Biểu đồ trực quan về lượt khám, doanh thu và nhân khẩu học bệnh nhân.
- **Quản lý Danh mục**: Thuốc, vật tư y tế và các thiết lập hệ thống.
- **Giao diện hiện đại**: Hỗ trợ Dark/Light mode, tối ưu hóa trải nghiệm người dùng (UX).

## 🛠 Công nghệ sử dụng

Dự án được xây dựng trên nền tảng các công nghệ hiện đại nhất:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/).
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/).
- **Biểu đồ**: [Recharts](https://recharts.org/).
- **Quản lý Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/).
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## 📂 Cấu trúc thư mục

```text
QLPK-SaaS/
├── src/
│   ├── app/          # Routes & Layouts (App Router)
│   ├── components/   # UI & Feature Components (Dashboard, Patients, Prescriptions, etc.)
│   ├── actions/      # Server Actions (Xử lý logic phía Server & Supabase)
│   ├── lib/          # Utils, Config & Validation
│   ├── types/        # TypeScript Definitions
│   └── theme/        # Quản lý Theme & Styles
├── supabase/         # Database Migrations, Seed data & RPCs
├── public/           # Tài nguyên tĩnh (Images, Fonts)
├── tests/            # Unit Tests & Integration Tests
└── .brain/           # Eternal Context (Dữ liệu kiến thức của AI trợ lý)
```

## 📦 Hướng dẫn cài đặt

### Yêu cầu
- Node.js >= 18.x
- Tài khoản Supabase

### Các bước thực hiện

1. **Clone repository**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**:
   Tạo file `.env.local` và điền thông tin Supabase của bạn:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:3000`.

## 📝 Thông tin bổ sung

- Hệ thống sử dụng **Row Level Security (RLS)** để bảo vệ dữ liệu bệnh nhân.
- Các truy vấn được tối ưu hóa bằng **Parallel Data Fetching** và **Streaming**.
- Mọi dữ liệu về kiến thức dự án được lưu trữ trong thư mục `.brain` để hỗ trợ AI trợ lý hiểu ngữ cảnh tốt nhất.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường.

Mọi quyền được bảo lưu. Dự án này là tài sản trí tuệ thuộc về Nguyễn Duy Trường. Việc sao chép, sửa đổi hoặc phân phối trái phép mã nguồn này dưới bất kỳ hình thức nào đều bị nghiêm cấm.
