# QLPK SaaS - Hệ Thống Quản Lý Phòng Khám Nhi Khoa Thông Minh

Phần mềm quản lý phòng khám (QLPK SaaS) là một giải pháp toàn diện được thiết kế chuyên biệt cho các phòng khám nhi khoa. Dự án nhằm tối ưu hóa quy trình khám chữa bệnh, từ khâu tiếp nhận bệnh nhân, khám lâm sàng, kê đơn thuốc cho đến quản lý kho dược và báo cáo tài chính. Hệ thống được xây dựng trên nền tảng công nghệ hiện đại, đảm bảo tính bảo mật, tốc độ và trải nghiệm người dùng vượt trội.

## 🚀 Tính năng nổi bật

- **Quản lý Bệnh nhân Toàn diện**: Lưu trữ hồ sơ bệnh án điện tử, lịch sử khám bệnh, thông tin liên lạc và các chỉ số sinh tồn của bệnh nhi.
- **Quy trình Khám bệnh Chuyên nghiệp**: Hỗ trợ bác sĩ ghi chép triệu chứng, chẩn đoán và chỉ định điều trị một cách nhanh chóng.
- **Kê đơn Thuốc Thông minh**: Tự động gợi ý liều lượng theo độ tuổi/cân nặng, kiểm tra tồn kho thời gian thực và in đơn thuốc chuyên nghiệp.
- **Quản lý Kho thuốc & Vật tư**: Theo dõi nhập-xuất-tồn, cảnh báo hạn sử dụng và thuốc sắp hết.
- **Thống kê & Dashboard**: Biểu đồ trực quan về doanh thu, lượt khám, và phân tích nhân khẩu học bệnh nhân giúp chủ phòng khám có cái nhìn tổng quan.
- **Tùy biến Giao diện (Theme)**: Hỗ trợ Light/Dark mode với hệ thống hydration-safe, đảm bảo không có lỗi hiển thị khi tải trang.
- **Bảo mật Đa lớp**: Sử dụng Supabase Auth và Row Level Security (RLS) để bảo vệ dữ liệu nhạy cảm của bệnh nhân.

## 🛠 Công nghệ sử dụng

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/).
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL).
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Modern CSS engine.
- **Animations**: [Framer Motion](https://www.framer.com/motion/).
- **Biểu đồ**: [Recharts](https://recharts.org/).
- **Quản lý Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/).
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## 📦 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- Một project trên Supabase (để lấy API URL và Anon Key)

### Các bước cài đặt

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
   Tạo file `.env.local` tại thư mục gốc và cấu hình các thông số sau:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Khởi chạy môi trường phát triển**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập `http://localhost:3000`.

## 💻 Cách sử dụng

1. **Đăng nhập**: Sử dụng tài khoản bác sĩ/quản trị viên được cấp quyền trên Supabase.
2. **Tiếp nhận**: Thêm mới bệnh nhân hoặc tìm kiếm bệnh nhân cũ tại mục "Bệnh nhân".
3. **Khám bệnh**: Chọn bệnh nhân và bắt đầu phiên khám, nhập triệu chứng và chẩn đoán.
4. **Kê đơn**: Tìm kiếm thuốc trong danh mục, nhập số lượng và in đơn.
5. **Cài đặt**: Tùy chỉnh thông tin phòng khám và chế độ hiển thị (Sáng/Tối) tại mục "Cài đặt".

## ⚡ Tối ưu hóa hiệu năng (Mới cập nhật)

Dự án đã được tối ưu hóa chuyên sâu để đảm bảo trải nghiệm mượt mà:
- **Parallel Data Fetching**: Chuyển đổi các truy vấn tuần tự sang song song bằng `Promise.all`, giảm 50% thời gian chờ dữ liệu.
- **React Suspense & Streaming**: Sử dụng cơ chế Streaming của Next.js để hiển thị giao diện khung ngay lập tức trong khi dữ liệu đang được tải.
- **Server-side Data Hydration**: Nạp dữ liệu thống kê từ Server Component để tránh hiện tượng "nháy" loading trên Client.
- **Bundle Optimization**: Cấu hình `optimizePackageImports` cho các thư viện lớn như Lucide, Recharts để giảm dung lượng JS.
- **Debounced Search**: Tối ưu hóa tìm kiếm bệnh nhân, giảm số lượng request lên Server khi người dùng gõ phím.

## 📂 Cấu trúc thư mục

```text
QLPK-SaaS/
├── src/
│   ├── app/          # Routes & Layouts (App Router)
│   ├── components/   # UI & Feature Components
│   ├── actions/      # Server Actions (Business Logic)
│   ├── lib/          # Utils, Config & Validation
│   ├── types/        # TypeScript Definitions
│   └── theme/        # Theme Context & Global Styles
├── supabase/         # Database Migrations & RPCs
├── public/           # Static Assets
├── tests/            # Unit & Integration Tests
├── plans/            # Development Plans & Roadmaps
├── docs/             # Documentation & Specs
└── .brain/           # Eternal Context (Knowledge Base)
```

## 📝 Thông tin bổ sung

- Dự án được tối ưu hóa cho hiệu năng cao với việc sử dụng Server Components và RPC.
- Mọi thay đổi về schema database đều được quản lý qua migrations trong thư mục `supabase/`.
- Hệ thống có khả năng mở rộng (SaaS) để phục vụ nhiều phòng khám khác nhau trong tương lai.

## ⚖️ Bản quyền

Copyright 2026 Nguyễn Duy Trường.

Mọi quyền được bảo lưu. Dự án này là tài sản trí tuệ thuộc về Nguyễn Duy Trường. Việc sao chép, sửa đổi hoặc phân phối trái phép mã nguồn này dưới bất kỳ hình thức nào đều bị nghiêm cấm.
