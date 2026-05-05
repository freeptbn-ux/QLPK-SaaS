# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

![QLPK-SaaS](https://raw.githubusercontent.com/freeptbn-ux/QLPK-SaaS/main/public/logo.png)

QLPK-SaaS là một giải pháp phần mềm dưới dạng dịch vụ (SaaS) hiện đại, được thiết kế để tối ưu hóa quy trình quản lý tại các phòng khám vừa và nhỏ. Hệ thống cung cấp các công cụ mạnh mẽ từ quản lý bệnh nhân, kê đơn thuốc điện tử đến theo dõi kho thuốc và báo cáo doanh thu.

## 🚀 Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ thông tin cá nhân, tiểu sử bệnh lý và lịch sử khám chữa bệnh tập trung.
- **Kê đơn thuốc thông minh**: Tự động tính toán liều lượng, đơn giá và tổng tiền đơn thuốc. Giao diện tối ưu cho cả máy tính và thiết bị di động.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, cảnh báo khi thuốc sắp hết và quản lý quy cách đóng gói.
- **Dashboard & Báo cáo**: Trực quan hóa dữ liệu khám bệnh và doanh thu thông qua biểu đồ sinh động.
- **Giao diện hiện đại**: Hỗ trợ Dark Mode, thiết kế theo phong cách Glassmorphism và hiệu ứng chuyển động mượt mà.

## 🛠️ Công nghệ sử dụng

Dự án được xây dựng trên nền tảng công nghệ mới nhất:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Testing**: [Vitest](https://vitest.dev/)

## 📦 Cấu trúc thư mục

```text
QLPK-SaaS/
├── src/
│   ├── app/            # Next.js App Router (Pages & Layouts)
│   ├── components/     # UI Components (Feature-based & Shared)
│   ├── actions/        # Server Actions (Database logic)
│   ├── lib/            # Shared utilities & configurations
│   ├── types/          # TypeScript definitions
│   └── styles/         # Global styles
├── supabase/           # Database migrations & configuration
├── public/             # Static assets
├── tests/              # Unit & Integration tests
└── .brain/             # Agent Knowledge & Context
```

## ⚙️ Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js 18.x trở lên
- npm hoặc yarn

### 2. Các bước cài đặt

```bash
# Clone repository
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
cd QLPK-SaaS

# Cài đặt dependencies
npm install

# Cấu hình biến môi trường
cp .env.example .env.local
# Sau đó cập nhật các thông số Supabase của bạn vào .env.local
```

### 3. Chạy ứng dụng

```bash
# Chế độ phát triển (Development)
npm run dev

# Xây dựng bản sản xuất (Build)
npm run build

# Chạy bản sản xuất (Start)
npm run start
```

## 📝 Cách sử dụng

1. **Đăng nhập**: Sử dụng tài khoản bác sĩ/quản trị viên được cấp.
2. **Tiếp nhận bệnh nhân**: Tìm kiếm hoặc tạo mới hồ sơ bệnh nhân tại màn hình chính.
3. **Kê đơn**: Nhấn "Kê đơn mới", chọn thuốc từ danh sách gợi ý tự động (Autocomplete), nhập số lượng và chẩn đoán.
4. **Quản lý kho**: Cập nhật danh mục thuốc và số lượng nhập kho tại mục Quản lý thuốc.

## 🔒 Bản quyền

Copyright 2026 Nguyễn Duy Trường. All rights reserved.

---
*Dự án được phát triển với sự hỗ trợ của Antigravity AI.*
