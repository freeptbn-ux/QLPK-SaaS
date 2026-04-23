# QLPK-SaaS - Phần Mềm Quản Lý Phòng Khám Nhi Khoa

Hệ thống quản lý phòng khám hiện đại, đa nền tảng, được xây dựng trên nền tảng Web SaaS, giúp tối ưu hóa quy trình khám chữa bệnh, quản lý bệnh nhân và kho thuốc.

## 🌟 Tính Năng Chính

- **Quản Lý Bệnh Nhân**: Lưu trữ thông tin chi tiết, lịch sử khám bệnh, tìm kiếm thông minh không dấu.
- **Kê Đơn Thuốc**: Giao diện kê đơn nhanh chóng, gợi ý thuốc thông minh, tự động tính toán liều lượng.
- **Quản Lý Kho Thuốc**: Theo dõi tồn kho, giá nhập/bán, cảnh báo thuốc sắp hết.
- **Thống Kê & Báo Cáo**: Biểu đồ trực quan về doanh thu, số lượng bệnh nhân và tình hình sử dụng thuốc.
- **Tùy Chỉnh Linh Hoạt**: Thay đổi thông tin phòng khám, cấu hình phí khám, hỗ trợ giao diện Sáng/Tối (Dark Mode).

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **UI Framework**: [Material UI (MUI) v9](https://mui.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **State Management**: React Hooks, Server Actions
- **Validation**: [Zod](https://zod.dev/), React Hook Form
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: Vanilla CSS + MUI System

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js 20.x trở lên
- Tài khoản Supabase

### 2. Clone dự án
```bash
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
cd QLPK-SaaS
```

### 3. Cài đặt dependencies
```bash
npm install
```

### 4. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc và cấu hình các thông số Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Khởi tạo Database
Sử dụng các file migration trong thư mục `supabase/migrations` hoặc chạy SQL schema trực tiếp trên Supabase Dashboard.

### 6. Chạy dự án
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 📁 Cấu Trúc Thư Mục

- `src/actions`: Các hàm tương tác với cơ sở dữ liệu (Server Actions).
- `src/app`: Định nghĩa các routes, layouts và giao diện chính.
- `src/components`: Các thành phần giao diện tái sử dụng (UI & Features).
- `src/lib`: Thư viện dùng chung, cấu hình Supabase, utils.
- `src/theme`: Cấu hình giao diện Material UI.
- `src/types`: Các định nghĩa TypeScript interfaces.
- `supabase`: Chứa các file migration và cấu hình database.

## 📝 Ghi Chú
Dự án được chuyển đổi từ phiên bản Desktop (Python/SQLite) sang nền tảng Web SaaS để tăng tính linh hoạt và khả năng truy cập từ nhiều thiết bị.

---
Copyright 2026 Nguyễn Duy Trường
