# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-DB-green?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)

QLPK-SaaS là một giải pháp quản lý phòng khám hiện đại, được xây dựng trên nền tảng Web với kiến trúc SaaS, giúp tối ưu hóa quy trình khám chữa bệnh, kê đơn thuốc và quản lý hồ sơ bệnh nhân.

## ✨ Tính năng chính

- **Quản lý Bệnh nhân**: Lưu trữ thông tin cơ bản, tiểu sử bệnh lý và lịch sử khám bệnh.
- **Kê đơn thuốc thông minh**: Giao diện kê đơn tối ưu, hỗ trợ tính toán liều lượng thuốc nhi khoa.
- **Tra cứu liều dùng AI**: Tích hợp Gemini AI với công cụ Google Search để tra cứu liều dùng và hướng dẫn sử dụng thuốc chính xác từ các nguồn y tế uy tín.
- **Kho thuốc & Kho hàng**: Quản lý danh mục thuốc, đơn giá, quy cách đóng gói và theo dõi tồn kho tự động.
- **Tính liều nhanh**: Công cụ hỗ trợ bác sĩ tính liều siro/hỗn dịch dựa trên cân nặng cho trẻ em.
- **Báo cáo & Thống kê**: Theo dõi doanh thu, số lượng bệnh nhân và hiệu suất phòng khám qua biểu đồ trực quan.

## 🚀 Công nghệ sử dụng

### Frontend & Backend
- **Framework**: Next.js 16 (App Router) với các tính năng mới nhất (Server Components, Server Actions).
- **UI/UX**: React 19, Tailwind CSS 4, Framer Motion cho các hiệu ứng chuyển động mượt mà.
- **State Management**: React Hook Form, Zod cho validation, và React Context cho quản lý trạng thái toàn cục.
- **Caching**: Sử dụng React `cache` để tối ưu hóa hiệu suất fetch dữ liệu trong Server Components và fix lỗi truy cập cookies trong các phạm vi cache.

### Cơ sở dữ liệu & Auth
- **Backend-as-a-Service**: Supabase (PostgreSQL).
- **Authentication**: Supabase Auth tích hợp sẵn.
- **Row Level Security (RLS)**: Bảo mật dữ liệu ở cấp độ dòng, đảm bảo dữ liệu phòng khám được cách ly hoàn toàn.

### AI Integration
- **Model**: Google Gemini 2.5 Flash Lite.
- **Grounding**: Sử dụng Google Search tool để đảm bảo thông tin y tế luôn được cập nhật và có độ chính xác cao.
- **API Rotation**: Hệ thống xoay tua API key thông minh để xử lý rate limit.

## 📦 Cấu trúc thư mục

```text
├── src/
│   ├── actions/        # Server Actions (Xử lý logic phía Server & Mutations)
│   ├── app/           # Next.js App Router (Routes & Layouts)
│   ├── components/    # Thành phần UI tái sử dụng
│   ├── contexts/      # React Contexts (Quản lý trạng thái ứng dụng)
│   ├── hooks/         # Custom React Hooks
│   ├── lib/           # Tiện ích & Cấu hình (Supabase client, utils)
│   ├── theme/         # Cấu hình giao diện và màu sắc
│   └── types/         # Định nghĩa TypeScript
├── supabase/          # Database migrations & SQL scripts
├── .brain/            # Eternal Context (Dữ liệu hỗ trợ AI)
└── tests/             # Kiểm thử tự động (Vitest)
```

## 🛠️ Hướng dẫn cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env.local` dựa trên mẫu `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEYS=key1,key2,key3
   ```

4. **Chạy dự án ở chế độ phát triển:**
   ```bash
   npm run dev
   ```

## 🛠️ Hướng dẫn sử dụng

1. **Đăng nhập**: Sử dụng tài khoản đã được cấp để truy cập hệ thống.
2. **Quản lý bệnh nhân**: Thêm mới bệnh nhân hoặc tìm kiếm bệnh nhân cũ theo tên/mã ID.
3. **Kê đơn**: 
   - Trong trang chi tiết bệnh nhân, chọn "Tạo đơn thuốc".
   - Nhập chẩn đoán và chọn thuốc từ danh mục.
   - Click vào tên thuốc để **tra cứu liều dùng AI** nếu cần.
   - Sử dụng bộ tính liều nhanh để tính liều siro cho trẻ em.
4. **Thống kê**: Xem báo cáo doanh thu và lượt khám tại trang chủ dashboard.

## 🧪 Kiểm thử

Chạy bộ công cụ kiểm thử tự động:
```bash
npm test
```

## 📝 Thông tin bổ sung

Hệ thống được thiết kế để hoạt động tốt trên cả Desktop và Mobile (Responsive), tối ưu hóa tốc độ tải trang bằng cách sử dụng Server Components và cơ chế caching dữ liệu thông minh.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường
