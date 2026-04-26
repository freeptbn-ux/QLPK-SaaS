# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

QLPK-SaaS là giải pháp phần mềm hiện đại, toàn diện được thiết kế để tối ưu hóa quy trình vận hành và quản lý dành cho các phòng khám vừa và nhỏ. Hệ thống tích hợp các công nghệ tiên tiến để đảm bảo hiệu suất cao, giao diện thân thiện và tính bảo mật tuyệt đối cho dữ liệu y tế.

## ✨ Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ hồ sơ chi tiết, lịch sử khám bệnh, chẩn đoán và đơn thuốc. Tìm kiếm bệnh nhân nhanh chóng bằng thuật toán tối ưu.
- **Kê đơn thuốc điện tử**: Giao diện kê đơn thông minh, hỗ trợ gợi ý thuốc, liều dùng và tự động tính toán tổng chi phí đơn thuốc.
- **Quản lý Kho dược**: Theo dõi tồn kho thực tế, giá nhập, giá bán, cảnh báo khi thuốc sắp hết hạn hoặc sắp hết hàng.
- **Công cụ tính liều (Dose Calculator)**: Hỗ trợ bác sĩ tính toán liều lượng thuốc chính xác dựa trên cân nặng và độ tuổi bệnh nhân.
- **Thống kê & Báo cáo**: Tổng hợp doanh thu, số lượng bệnh nhân, phân tích tình hình hoạt động theo ngày, tháng, năm thông qua biểu đồ trực quan (Recharts).
- **Bảo mật & Phân quyền**: Hệ thống xác thực an toàn thông qua Supabase Auth, đảm bảo chỉ nhân viên có thẩm quyền mới có thể truy cập dữ liệu nhạy cảm.

## 🚀 Công nghệ sử dụng

Hệ thống được phát triển trên nền tảng công nghệ State-of-the-art:

- **Frontend**: [Next.js 16.2](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) (Animation)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (PostgreSQL, Edge Functions/RPC, Auth)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🛠️ Hướng dẫn cài đặt

Để triển khai dự án tại môi trường local, vui lòng thực hiện các bước sau:

### 1. Clone Repository
```bash
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
cd QLPK-SaaS
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc với các nội dung sau:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Khởi chạy ứng dụng
```bash
npm run dev
```
Sau đó truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

## 📁 Cấu trúc thư mục

```text
src/
├── actions/        # Server Actions xử lý logic nghiệp vụ backend
├── app/            # Next.js App Router (Pages, Layouts)
├── components/     # UI Components (features và generic ui)
├── hooks/          # Custom React Hooks
├── lib/            # Utilities, Supabase Config, Validations
├── theme/          # Cấu hình giao diện và màu sắc
└── types/          # Định nghĩa kiểu dữ liệu TypeScript
supabase/
└── migrations/     # Quản lý schema database bằng SQL migrations
plans/              # Tài liệu các phase phát triển tính năng
scripts/            # Script bảo trì và chuyển đổi dữ liệu
```

## 📜 Bản quyền

Copyright 2026 Nguyễn Duy Trường. All rights reserved.
