# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Hiện Đại

QLPK-SaaS là giải pháp phần mềm chuyên dụng được thiết kế để tối ưu hóa quy trình vận hành cho các phòng khám vừa và nhỏ. Với triết lý tập trung vào trải nghiệm người dùng và tính chính xác trong y tế, hệ thống giúp bác sĩ quản lý hồ sơ bệnh nhân, kê đơn và theo dõi kho thuốc một cách hiệu quả nhất.

## 🌟 Tính Năng Nổi Bật

- **Quản Lý Bệnh Nhân Toàn Diện**: Lưu trữ thông tin cá nhân, tiểu sử bệnh lý và lịch sử thăm khám chi tiết.
- **Kê Đơn Thuốc Thông Minh**: Giao diện kê đơn nhanh chóng, hỗ trợ tính toán tổng tiền tự động và quản lý liều lượng.
- **Công Cụ Tính Liều Nhanh**: Tích hợp bộ tính liều chuyên dụng (đặc biệt hữu ích cho nhi khoa), hỗ trợ tính toán liều dùng dựa trên cân nặng.
- **Quản Lý Kho Thuốc**: Theo dõi số lượng tồn kho, đơn giá và quy cách đóng gói thuốc.
- **Báo Cáo & Thống Kê**: Cung cấp cái nhìn tổng quan về tình hình hoạt động của phòng khám qua các biểu đồ trực quan.
- **Trải Nghiệm Đa Nền Tảng**: Giao diện Responsive hoàn hảo trên Desktop, Tablet và Mobile.
- **Chế Độ Tối (Dark Mode)**: Giao diện hiện đại, giảm mỏi mắt cho bác sĩ khi làm việc cường độ cao.

## 🛠️ Công Nghệ Sử Dụng

Dự án được phát triển dựa trên những công nghệ web mạnh mẽ và hiện đại nhất hiện nay:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Cơ sở dữ liệu & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Quản lý Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Biểu đồ**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Cấu Trúc Dự Án

```text
src/
├── app/            # Tuyến đường và giao diện chính (App Router)
├── actions/        # Các hàm xử lý phía Server (Server Actions)
├── components/     # Các thành phần giao diện tái sử dụng
│   ├── features/   # Thành phần UI theo chức năng (Bệnh nhân, Thuốc, Đơn thuốc...)
│   └── ui/         # Thành phần UI cơ bản (Button, Input, Card...)
├── lib/            # Thư viện tiện ích, cấu hình Supabase và định nghĩa Validation
├── types/          # Định nghĩa kiểu dữ liệu (TypeScript Interfaces)
└── supabase/       # Cấu hình Database, Migrations và Types
```

## ⚙️ Hướng Dẫn Cài Đặt

### Yêu cầu:
- Node.js 18.x trở lên
- Tài khoản Supabase (đã thiết lập Database)

### Các bước thực hiện:

1. **Clone mã nguồn**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Cấu hình môi trường**:
   Tạo file `.env.local` trong thư mục gốc và điền các thông tin sau:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=địa_chỉ_supabase_của_bạn
   NEXT_PUBLIC_SUPABASE_ANON_KEY=mã_anon_key_của_bạn
   ```

4. **Khởi chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   Truy cập [http://localhost:3000](http://localhost:3000) để trải nghiệm.

## 🔒 Bảo Mật & Lưu Ý

- **API Keys**: Tuyệt đối không chia sẻ hoặc upload file `.env.local` chứa các khóa bảo mật lên các nền tảng công khai.
- **Lưu trữ**: Toàn bộ dữ liệu được lưu trữ bảo mật trên nền tảng Supabase với chính sách RLS (Row Level Security).

## 📄 Bản Quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được xây dựng và phát triển với sự hỗ trợ của Antigravity AI.*
