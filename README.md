# QLPK SaaS - Hệ thống Quản lý Phòng khám Thông minh

QLPK SaaS là một nền tảng quản lý phòng khám hiện đại, được thiết kế để tối ưu hóa quy trình làm việc của bác sĩ và nhân viên y tế. Hệ thống cung cấp các công cụ từ quản lý bệnh nhân, theo dõi kho thuốc đến tính toán liều lượng thuốc tự động và báo cáo thống kê.

## ✨ Tính năng nổi bật

- **Quản lý Bệnh nhân**: Lưu trữ hồ sơ bệnh án, lịch sử khám bệnh và thông tin chi tiết của từng bệnh nhân.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, đơn giá, và cảnh báo khi thuốc sắp hết hạn hoặc hết hàng.
- **Kê đơn & Tính liều**: Hỗ trợ bác sĩ kê đơn nhanh chóng với công cụ tính toán liều lượng thuốc thông minh.
- **Báo cáo Thống kê**: Biểu đồ trực quan về doanh thu, số lượng bệnh nhân và tình hình sử dụng thuốc.
- **Giao diện Hiện đại**: Hỗ trợ Chế độ Sáng/Tối (Light/Dark mode) với trải nghiệm người dùng mượt mà.
- **Thiết kế Responsive**: Hoạt động tốt trên cả máy tính để bàn, máy tính bảng và thiết bị di động.

## 🛠️ Công nghệ sử dụng

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Heroicons, Hi2)
- **State Management**: React Hooks & Server Actions
- **Ngôn ngữ**: TypeScript

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository
```bash
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
cd QLPK-SaaS
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` dựa trên mẫu `.env.example` và điền các thông tin kết nối Supabase của bạn:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Chạy ứng dụng ở chế độ phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

## 📁 Cấu trúc thư mục chính

- `src/app`: Chứa các routes và layout của ứng dụng (Next.js App Router).
- `src/components`: Các thành phần giao diện dùng chung và theo tính năng.
- `src/actions`: Các Server Actions xử lý logic backend và tương tác với Database.
- `src/hooks`: Các custom hooks dùng cho logic UI.
- `src/lib`: Các cấu hình thư viện bên thứ ba (Supabase, utils).
- `src/theme`: Quản lý cấu hình giao diện và chế độ sáng/tối.
- `src/types`: Định nghĩa kiểu dữ liệu TypeScript.
- `supabase`: Chứa các file migration và cấu hình database.

## 📝 Sử dụng

1. **Đăng nhập**: Sử dụng tài khoản bác sĩ/quản trị viên được cấp.
2. **Tiếp nhận bệnh nhân**: Thêm mới hoặc tìm kiếm bệnh nhân trong danh sách.
3. **Kê đơn**: Chọn bệnh nhân, nhập chẩn đoán và chọn thuốc từ kho. Hệ thống sẽ tự động tính toán tổng tiền.
4. **Theo dõi kho**: Kiểm tra mục "Kho thuốc" thường xuyên để đảm bảo nguồn cung.

## 📄 Bản quyền

Copyright 2026 Nguyễn Duy Trường. All rights reserved.
