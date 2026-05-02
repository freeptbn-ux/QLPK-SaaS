# 🏥 Hệ Thống Quản Lý Phòng Khám (QLPK-SaaS)

Chào mừng bạn đến với dự án **QLPK-SaaS** - Một giải pháp quản lý phòng khám hiện đại, tinh gọn và hiệu quả, được xây dựng trên nền tảng công nghệ mới nhất.

## 🌟 Tổng Quan Dự Án

QLPK-SaaS là ứng dụng quản lý phòng khám đa năng, hỗ trợ các bác sĩ và nhân viên y tế trong việc:
- Quản lý hồ sơ bệnh nhân chi tiết và khoa học.
- Theo dõi lịch sử khám bệnh và kê đơn thuốc điện tử.
- Công cụ tính liều thuốc nhanh chóng, chính xác theo cân nặng.
- Thống kê doanh thu và hoạt động phòng khám qua biểu đồ trực quan.
- Hệ thống phân quyền bảo mật, đảm bảo an toàn dữ liệu y tế.

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng với các công nghệ tiên tiến nhất hiện nay:

- **Frontend Core**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) cho các hiệu ứng tương tác mượt mà.
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres + RLS) cung cấp hạ tầng backend thời gian thực và bảo mật.
- **Form Management**: [React Hook Form](https://react-hook-form.com/) kết hợp với [Zod](https://zod.dev/) để xác thực dữ liệu chặt chẽ.
- **Biểu Đồ**: [Recharts](https://recharts.org/) giúp trực quan hóa dữ liệu y tế.
- **Testing**: [Vitest](https://vitest.dev/) đảm bảo tính ổn định và chính xác của các tính năng cốt lõi.

## 📂 Cấu Trúc Thư Mục

```text
src/
├── actions/        # Server Actions xử lý logic backend
├── app/            # Next.js App Router (Auth, Dashboard, Patients...)
├── components/     # Các thành phần UI tái sử dụng và logic UI phức tạp
│   ├── features/   # Thành phần UI theo chức năng (Patient, Prescription...)
│   └── ui/         # Thành phần UI cơ bản (Button, Input, Card...)
├── hooks/          # Custom Hooks cho logic React
├── lib/            # Tiện ích (Utils, Supabase Client, Validations)
├── types/          # Định nghĩa kiểu dữ liệu TypeScript
└── theme/          # Cấu hình giao diện và màu sắc
```

## ⚙️ Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js 18.x trở lên
- Tài khoản Supabase (để cấu hình Database)

### 2. Các bước thực hiện

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
   Tạo file `.env.local` trong thư mục gốc và điền các thông tin từ dự án Supabase của bạn:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Khởi chạy ứng dụng**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000)

## 🚀 Cách Sử Dụng

1. **Đăng nhập**: Sử dụng tài khoản bác sĩ hoặc nhân viên y tế để truy cập hệ thống.
2. **Tiếp đón bệnh nhân**: Tìm kiếm hoặc tạo mới hồ sơ bệnh nhân tại mục "Bệnh nhân".
3. **Khám & Kê đơn**: Nhập chẩn đoán, sử dụng bộ công cụ tính liều để kê đơn thuốc nhanh chóng.
4. **Theo dõi**: Xem lại lịch sử khám và xuất hóa đơn thuốc cho bệnh nhân.

## 📄 Bản Quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển và duy trì với sự hỗ trợ của Antigravity AI.*
