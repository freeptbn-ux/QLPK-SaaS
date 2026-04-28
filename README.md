# QLPK SaaS - Hệ Thống Quản Lý Phòng Khám Hiện Đại

QLPK SaaS là một nền tảng quản lý phòng khám toàn diện, được thiết kế để tối ưu hóa quy trình làm việc của bác sĩ và nhân viên y tế. Ứng dụng cung cấp các công cụ mạnh mẽ từ quản lý hồ sơ bệnh nhân, theo dõi kho thuốc đến tính toán liều lượng thuốc chính xác.

## 🚀 Tính Năng Chính

- **Quản Lý Bệnh Nhân**: Lưu trữ hồ sơ chi tiết, lịch sử khám bệnh, và chẩn đoán. Hỗ trợ tìm kiếm thông minh và lọc theo tiêu chí.
- **Quản Lý Kho Thuốc**: Theo dõi số lượng tồn kho, quản lý danh mục thuốc, và cảnh báo thuốc sắp hết.
- **Tính Liều Thuốc (Dose Calculator)**: Công cụ hỗ trợ bác sĩ tính toán liều lượng thuốc chính xác dựa trên cân nặng và phác đồ điều trị.
- **Thống Kê & Báo Cáo**: Biểu đồ trực quan về lượng bệnh nhân, doanh thu, và các chỉ số vận hành quan trọng.
- **Tùy Chỉnh Thương Hiệu**: Cho phép thay đổi tên phòng khám và thông tin liên hệ một cách linh hoạt.

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng trên các công nghệ hiện đại nhất hiện nay:

- **Frontend**: [Next.js 16](https://nextjs.org/) (React 19), [Tailwind CSS 4](https://tailwindcss.com/)
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)
- **Cơ sở dữ liệu & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Quản lý form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Hiệu ứng & Hoạt ảnh**: [Framer Motion](https://www.framer.com/motion/)
- **Biểu đồ**: [Recharts](https://recharts.org/)
- **Kiểm thử**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 📂 Cấu Trúc Thư Mục

```text
├── src/
│   ├── app/            # Next.js App Router (Pages & Layouts)
│   ├── components/     # UI Components (Feature-based & Common)
│   ├── actions/        # Server Actions (API & Database logic)
│   ├── contexts/       # React Contexts (Settings, Auth, v.v.)
│   ├── lib/            # Utilities & Helpers
│   └── types/          # TypeScript interfaces/types
├── supabase/           # Migrations & Database schema
├── public/             # Static assets (Images, Fonts)
├── tests/              # Global test setup
└── .brain/             # Tri thức & Context của dự án (Eternal Context)
```

## ⚙️ Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js 18.x trở lên
- npm hoặc yarn

### 2. Các bước cài đặt

```bash
# Clone dự án
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git

# Di chuyển vào thư mục dự án
cd QLPK-SaaS

# Cài đặt dependencies
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` dựa trên mẫu `.env.example` và điền các thông số Supabase của bạn:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy ứng dụng

```bash
# Chế độ phát triển (Development)
npm run dev

# Xây dựng bản production
npm run build
```

## 📝 Cách Sử Dụng

1. Đăng nhập vào hệ thống bằng tài khoản được cấp.
2. Truy cập mục **Bệnh nhân** để tạo hồ sơ mới hoặc xem lịch sử khám.
3. Sử dụng công cụ **Tính liều** để hỗ trợ kê đơn thuốc nhanh chóng.
4. Kiểm tra **Thống kê** định kỳ để nắm bắt tình hình hoạt động của phòng khám.

---

**Copyright 2026 Nguyễn Duy Trường**
