# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

QLPK-SaaS là một giải pháp phần mềm hiện đại được thiết kế để tối ưu hóa quy trình quản lý tại các phòng khám vừa và nhỏ. Hệ thống cung cấp các công cụ mạnh mẽ từ việc quản lý bệnh nhân, kê đơn thuốc điện tử đến theo dõi doanh thu và thống kê báo cáo.

## ✨ Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ thông tin chi tiết, lịch sử khám bệnh và đơn thuốc của từng bệnh nhân.
- **Kê đơn thuốc thông minh**: Giao diện kê đơn nhanh chóng, hỗ trợ gợi ý thuốc và tự động tính toán tổng tiền.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, giá nhập, giá bán và cảnh báo khi thuốc sắp hết.
- **Thống kê & Báo cáo**: Biểu đồ trực quan về doanh thu, số lượng bệnh nhân theo ngày/tháng/năm.
- **Công cụ tính liều lượng**: Hỗ trợ bác sĩ tính toán liều lượng thuốc chính xác dựa trên thông tin bệnh nhân.
- **Bảo mật & Phân quyền**: Đăng nhập an toàn, bảo vệ dữ liệu y tế nhạy cảm.

## 🚀 Công nghệ sử dụng

Hệ thống được xây dựng trên những công nghệ hiện đại nhất hiện nay:

- **Frontend**: [Next.js 16+](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth, Database, Storage, RPC)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Date Handling**: [Day.js](https://day.js.org/)

## 🛠️ Hướng dẫn cài đặt

Để chạy dự án local, hãy thực hiện theo các bước sau:

1. **Clone repository:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env.local` trong thư mục gốc và thêm các thông tin sau (lấy từ Supabase project của bạn):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Chạy dự án:**
   ```bash
   npm run dev
   ```
   Truy cập `http://localhost:3000` để xem kết quả.

## 📁 Cấu trúc thư mục

```text
src/
├── actions/        # Các Server Actions xử lý logic backend
├── app/            # Các trang và route (App Router)
├── components/     # Các UI components tái sử dụng
├── hooks/          # Custom React hooks
├── lib/            # Tiện ích, cấu hình database và validation
├── theme/          # Cấu hình màu sắc và giao diện
└── types/          # Định nghĩa TypeScript interfaces
```

## 📜 Bản quyền

Copyright © 2026 Nguyễn Duy Trường. All rights reserved.
