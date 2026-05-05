# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Hiện Đại

QLPK-SaaS là một giải pháp quản lý phòng khám toàn diện, được xây dựng trên nền tảng công nghệ hiện đại, giúp tối ưu hóa quy trình làm việc, quản lý hồ sơ bệnh nhân, kê đơn thuốc và theo dõi doanh thu một cách hiệu quả.

## 🚀 Công Nghệ Sử Dụng

Dự án được xây dựng với bộ công nghệ (Tech Stack) mạnh mẽ và tiên tiến nhất:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) cho giao diện responsive và hiện đại.
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime).
- **State Management & Forms**: [React Hook Form](https://react-hook-form.com/) kết hợp với [Zod](https://zod.dev/) để validation dữ liệu.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) cho các hiệu ứng chuyển động mượt mà.
- **Testing**: [Vitest](https://vitest.dev/) và [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) đảm bảo độ ổn định của code.

## ✨ Tính Năng Chính

- **Quản lý bệnh nhân**: Lưu trữ thông tin chi tiết, lịch sử khám bệnh.
- **Quản lý đơn thuốc**: Kê đơn nhanh chóng, tìm kiếm thuốc thông minh (Autocomplete).
- **Hóa đơn & Doanh thu**: Tự động tính toán tổng tiền, quản lý trạng thái thanh toán.
- **Giao diện Responsive**: Tối ưu hóa trải nghiệm trên cả Desktop và Mobile (đặc biệt là các ô nhập liệu số lượng và ngày tháng).
- **Chế độ Sáng/Tối (Dark Mode)**: Giao diện thân thiện với mắt người dùng.

## 🛠️ Hướng Dẫn Cài Đặt

### 1. Clone dự án
```bash
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
cd QLPK-SaaS
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env.local` tại thư mục gốc và điền các thông tin kết nối Supabase của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy ứng dụng ở chế độ phát triển
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

## 📁 Cấu Trúc Thư Mục

- `src/app/`: Định nghĩa các route và trang của ứng dụng.
- `src/components/`:
  - `ui/`: Các component giao diện dùng chung (Button, Input, Modal...).
  - `features/`: Các component theo tính năng (Prescription, Patient, Invoice...).
- `src/lib/`: Chứa các cấu hình Supabase và utility functions.
- `src/types/`: Định nghĩa các interface và type cho TypeScript.
- `supabase/`: Chứa các file cấu hình và migration của database.
- `.brain/`: Thư mục lưu trữ kiến thức và ngữ cảnh của AI trợ lý (Antigravity).

## 🧪 Kiểm Thử

Để chạy các bộ test unit:
```bash
npm test
```

## 📝 Bản Quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được hỗ trợ phát triển bởi Antigravity AI.*
