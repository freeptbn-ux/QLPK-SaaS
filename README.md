# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Hiện Đại

QLPK-SaaS là một giải pháp phần mềm hiện đại được thiết kế để tối ưu hóa quy trình quản lý phòng khám, hồ sơ bệnh nhân và lịch hẹn. Ứng dụng được xây dựng trên nền tảng web với giao diện mượt mà, thân thiện và hiệu năng cao.

## 🚀 Tính Năng Chính

- **Quản lý Bệnh nhân**: Thêm mới, cập nhật và theo dõi hồ sơ bệnh nhân chi tiết.
- **Hồ sơ Y tế**: Lưu trữ lịch sử khám bệnh, chẩn đoán và cân nặng.
- **Giao diện Responsive**: Hoạt động hoàn hảo trên cả máy tính và thiết bị di động.
- **Chế độ Tối (Dark Mode)**: Tối ưu trải nghiệm người dùng trong mọi điều kiện ánh sáng.
- **Tự động hóa**: Các tính năng thông minh giúp nhập liệu nhanh chóng và chính xác.

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng với các công nghệ tiên tiến nhất hiện nay:

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router), [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/), [Lucide React](https://lucide.dev/)
- **Backend**: [Supabase](https://supabase.com/) (Database & Auth)
- **Deployment**: [Vercel](https://vercel.com/)

## 📂 Cấu Trúc Thư Mục

```text
src/
├── app/            # Next.js App Router (Pages & Layouts)
├── actions/        # Server Actions (Xử lý logic Database)
├── components/     # UI Components
│   ├── features/   # Các component theo tính năng (bệnh nhân,...)
│   └── ui/         # Các component UI dùng chung
├── lib/            # Tiện ích (utils) và Validation (zod)
├── types/          # Định nghĩa kiểu TypeScript
└── plans/          # Kế hoạch phát triển dự án
```

## ⚙️ Hướng Dẫn Cài Đặt

### Yêu cầu hệ thống:
- Node.js 18.x trở lên
- npm hoặc yarn

### Các bước cài đặt:

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
   Tạo file `.env.local` từ mẫu và điền thông tin Supabase của bạn:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Chạy ứng dụng ở chế độ phát triển**:
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 🔒 Bảo Mật & Lưu Ý

- Tuyệt đối không commit các file chứa API key (như `.env.local`) lên Github.
- Dự án đã được cấu hình `.gitignore` chuẩn cho Next.js và Supabase.
- Thư mục `.brain` chứa dữ liệu ngữ cảnh phát triển được phép upload để đồng bộ hóa.

## 📄 Bản Quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển với sự hỗ trợ của Antigravity AI.*
