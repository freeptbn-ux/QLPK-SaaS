# QLPK-SaaS (Phần Mềm Quản Lý Phòng Khám)

Dự án QLPK-SaaS là một giải pháp phần mềm quản trị toàn diện dành cho các phòng khám, giúp tối ưu hóa quy trình khám chữa bệnh, quản lý bệnh nhân, thuốc và doanh thu.

## 🚀 Công Nghệ Sử Dụng

Dự án được xây dựng dựa trên các công nghệ hiện đại nhằm đảm bảo hiệu suất, tính bảo mật và khả năng mở rộng:
- **Framework & Thư viện:** Next.js (React), TypeScript.
- **Giao diện (UI/UX):** Tailwind CSS, Framer Motion, Recharts.
- **Quản lý Form & Validation:** React Hook Form, Zod.
- **Backend & Database:** Supabase (PostgreSQL, Supabase SSR).
- **Kiểm thử (Testing):** Vitest, Testing Library.

## ⚙️ Hướng Dẫn Cài Đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt các gói phụ thuộc (dependencies):**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường:**
   Tạo file `.env.local` từ mẫu (nếu có) và điền các cấu hình cần thiết (như `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## 💻 Cách Sử Dụng

Để khởi chạy dự án trong môi trường phát triển (development):

```bash
npm run dev
```

Sau đó, mở trình duyệt và truy cập vào địa chỉ: `http://localhost:3000`.

## 📁 Cấu Trúc Thư Mục

- `src/`: Mã nguồn chính của dự án, bao gồm components, app, lib.
- `public/`: Chứa các tài nguyên tĩnh (images, icons...).
- `docs/`: Tài liệu hướng dẫn.
- `plans/`: Chứa kế hoạch phát triển và thiết kế.
- `supabase/`: Cấu hình Supabase.
- `.brain/`: Thư mục chứa cấu hình và dữ liệu cục bộ cho agent workflow.

## 📄 Bản Quyền

Copyright 2026 Nguyễn Duy Trường.
