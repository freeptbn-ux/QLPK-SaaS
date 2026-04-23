# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

QLPK-SaaS là một giải pháp quản lý phòng khám hiện đại được xây dựng dưới dạng phần mềm dịch vụ (SaaS). Hệ thống giúp tối ưu hóa quy trình quản lý bệnh nhân, kho thuốc, kê đơn và theo dõi doanh thu một cách hiệu quả, chuyên nghiệp.

## 🚀 Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ hồ sơ bệnh lý, tiểu sử, cân nặng và thông tin liên lạc của bệnh nhân. Tìm kiếm thông minh theo tên (không dấu) hoặc số điện thoại.
- **Lịch sử Dùng thuốc**: Tính năng mới cho phép bác sĩ xem tổng hợp tất cả các loại thuốc mà bệnh nhân đã từng sử dụng, kèm theo số lần kê mỗi loại, giúp đưa ra quyết định điều trị chính xác hơn.
- **Quản lý Thuốc & Kho**: Theo dõi số lượng tồn kho theo thời gian thực, cảnh báo thuốc sắp hết (Low Stock), quản lý đơn giá và quy cách đóng gói.
- **Hệ thống Kê đơn**: Quy trình kê đơn nhanh chóng thông qua RPC database, tự động tính toán tổng chi phí và in đơn thuốc chuyên nghiệp.
- **Công cụ Tính liều lượng**: Hỗ trợ bác sĩ tính toán liều lượng thuốc dựa trên cân nặng và các thông số lâm sàng với các bộ preset định sẵn.
- **Báo cáo & Thống kê**: Biểu đồ trực quan về lượt khám, doanh thu và mức độ tiêu thụ thuốc theo thời gian bằng Recharts.
- **Giao diện Hiện đại**: Hỗ trợ chế độ Sáng/Tối (Dark Mode) và tương thích hoàn toàn với các thiết bị di động (Responsive).

## 🛠️ Công nghệ sử dụng

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [Material UI (MUI) v9](https://mui.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Postgres, Auth, RLS)
- **State Management**: React Hook Form + Zod (Validation)
- **Charts**: Recharts
- **Styling**: Vanilla CSS + Emotion
- **Ngôn ngữ**: TypeScript

## 📦 Cấu trúc thư mục

```text
.
├── src/
│   ├── actions/      # Server Actions xử lý logic nghiệp vụ (Patients, Medicines, Prescriptions)
│   ├── app/          # App Router (Dashboard, Login, Patients, Statistics, etc.)
│   ├── components/   # Các UI Components (Features, UI elements)
│   ├── hooks/        # Custom React Hooks
│   ├── lib/          # Cấu hình Supabase, utils chuẩn hóa dữ liệu
│   ├── theme/        # Cấu hình MUI Theme (Light/Dark mode)
│   └── types/        # TypeScript Definitions & Database Interfaces
├── supabase/
│   └── migrations/   # File SQL khởi tạo schema và RLS policies
├── public/           # Assets tĩnh (images, icons)
├── plans/            # Tài liệu kế hoạch và tiến độ phát triển
└── scratch/          # Scripts kiểm thử và công cụ hỗ trợ
```

## ⚙️ Cài đặt

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
   Tạo file `.env.local` từ mẫu `.env.example` và điền thông tin Supabase của bạn:
   ```text
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Chạy dự án ở chế độ phát triển**:
   ```bash
   npm run dev
   ```

5. **Build cho production**:
   ```bash
   npm run build
   npm start
   ```

## 📝 Cách sử dụng

- Đăng nhập vào hệ thống bằng tài khoản email/mật khẩu thông qua Supabase Auth.
- Sử dụng Sidebar (Desktop) hoặc Bottom Nav (Mobile) để chuyển đổi giữa các module.
- Hệ thống hỗ trợ phím tắt để thao tác nhanh hơn trong quá trình khám bệnh.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển bởi Nguyễn Duy Trường.*
