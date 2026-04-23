# QLPK-SaaS - Hệ thống Quản lý Phòng khám Thông minh

QLPK-SaaS là một giải pháp phần mềm dạng dịch vụ (SaaS) được thiết kế hiện đại nhằm tối ưu hóa quy trình quản lý tại các phòng khám tư nhân. Hệ thống giúp bác sĩ và nhân viên y tế quản lý hồ sơ bệnh nhân, kê đơn thuốc và theo dõi số liệu thống kê một cách hiệu quả và chính xác.

## 🚀 Công nghệ sử dụng

Hệ thống được xây dựng trên nền tảng các công nghệ hiện đại nhất:

- **Frontend Framework:** [Next.js 16 (App Router)](https://nextjs.org/) với React 19.
- **Giao diện người dùng:** [Material UI v9](https://mui.com/) đem lại trải nghiệm mượt mà, chuyên nghiệp.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL & Auth).
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) đảm bảo tính chặt chẽ và an toàn của mã nguồn.
- **Quản lý biểu đồ:** [Recharts](https://recharts.org/) cho các báo cáo thống kê trực quan.
- **Xác thực dữ liệu:** [Zod](https://zod.dev/) & React Hook Form.
- **Kiểm thử:** Vitest.

## ✨ Các tính năng chính

- **Quản lý Bệnh nhân:** Theo dõi thông tin cá nhân, lịch sử khám bệnh và hồ sơ bệnh án.
- **Kê đơn thuốc điện tử:** Quy trình kê đơn nhanh chóng, hỗ trợ tìm kiếm thuốc thông minh và tính toán liều lượng.
- **Thống kê & Báo cáo:** Dashboard hiển thị số lượng bệnh nhân, doanh thu và các chỉ số sức khỏe định kỳ.
- **Quản lý kho thuốc:** Quản lý danh mục thuốc, quy cách đóng gói và giá thành.
- **Công cụ hỗ trợ:** Máy tính liều lượng thuốc (Dose Calculator).
- **Bảo mật:** Hệ thống phân quyền và xác thực người dùng an toàn qua Supabase Auth.

## 📦 Cấu trúc thư mục

```text
├── src/
│   ├── actions/        # Server Actions xử lý logic nghiệp vụ
│   ├── app/           # Next.js App Router (Pages & Layouts)
│   ├── components/    # Components dùng chung và theo tính năng
│   ├── lib/           # Các thư viện bổ trợ, tiện ích (utils)
│   ├── types/         # Định nghĩa TypeScript interfaces
│   └── supabase/      # Cấu hình và client kết nối Supabase
├── public/            # Tài sản tĩnh (images, icons)
├── plans/             # Tài liệu kế hoạch phát triển dự án
└── docs/              # Tài liệu hướng dẫn và đặc tả
```

## 🛠️ Hướng dẫn cài đặt

Để chạy dự án này ở môi trường cục bộ, hãy làm theo các bước sau:

1. **Clone repository:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt phụ thuộc:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env.local` dựa trên mẫu `.env.example` và điền thông tin Supabase của bạn:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 📝 Hướng dẫn sử dụng

- Đăng nhập vào hệ thống bằng tài khoản đã cấp.
- Sử dụng thanh điều hướng để di chuyển giữa các mục: Bệnh nhân, Thuốc, Thống kê.
- Tại mục Bệnh nhân, bạn có thể thêm mới hoặc tìm kiếm bệnh nhân cũ để thực hiện kê đơn thuốc.

## 📄 Bản quyền

Copyright 2026 Nguyễn Duy Trường.

---
*Dự án được phát triển với sự hỗ trợ của Antigravity AI.*
