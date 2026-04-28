# QLPK SaaS - Phần mềm Quản lý Phòng khám Nhi khoa

Dự án **QLPK SaaS** là một giải pháp quản lý phòng khám hiện đại, được tối ưu hóa đặc biệt cho quy trình khám chữa bệnh tại các phòng khám nhi khoa. Ứng dụng cung cấp một hệ sinh thái đầy đủ các tính năng giúp số hóa toàn bộ quy trình từ tiếp đón bệnh nhân đến kê đơn thuốc và báo cáo doanh thu.

## 🌟 Tính năng nổi bật

- **Quản lý bệnh nhân chuyên sâu:** Lưu trữ thông tin bệnh nhân, lịch sử khám bệnh, biểu đồ tăng trưởng và tìm kiếm thông minh.
- **Quản lý kho thuốc & Vật tư:** Theo dõi tồn kho thời gian thực, cảnh báo hạn sử dụng và thuốc sắp hết.
- **Hệ thống kê đơn điện tử:** Quy trình kê đơn nhanh chóng, tích hợp máy tính liều lượng thuốc thông minh và in đơn thuốc chuyên nghiệp.
- **Thống kê & Dashboard:** Hệ thống báo cáo trực quan với biểu đồ về doanh thu, lượt khám và hiệu quả sử dụng thuốc.
- **Cài đặt hệ thống linh hoạt:** Tùy chỉnh thông tin phòng khám, quản lý danh mục thuốc và cấu hình bảo mật.
- **Trải nghiệm người dùng cao cấp:** Giao diện hiện đại, mượt mà với hiệu ứng Framer Motion, hỗ trợ đầy đủ Dark Mode.

## 🚀 Công nghệ sử dụng

Hệ thống được xây dựng trên nền tảng các công nghệ hiện đại nhất hiện nay:

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/).
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) - Thiết kế hiện đại, tối ưu hiệu suất.
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Real-time updates).
- **Trạng thái & Form:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) (Validation).
- **Animation:** [Framer Motion](https://www.framer.com/motion/).
- **Biểu đồ:** [Recharts](https://recharts.org/).
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/), [Hi2 Icons](https://react-icons.github.io/react-icons/icons/hi2/).
- **Testing:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## 📁 Cấu trúc thư mục

```text
src/
├── actions/        # Server Actions xử lý logic backend & tương tác DB
├── app/            # Next.js App Router (Layouts, Pages, APIs)
├── components/     # Các UI Components được module hóa
│   ├── ui/         # Components giao diện dùng chung (Button, Input,...)
│   └── features/   # Components theo chức năng nghiệp vụ
├── contexts/       # React Context Providers (Settings, Auth, Theme)
├── hooks/          # Custom Hooks dùng chung
├── lib/            # Cấu hình thư viện (Supabase client, utils)
└── types/          # Định nghĩa kiểu dữ liệu (TypeScript Interfaces)
```

## ⚙️ Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js 20+
- Tài khoản Supabase

### 2. Cài đặt chi tiết
1. **Clone dự án:**
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   Tạo file `.env.local` từ mẫu `.env.example`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Khởi động Dev Server:**
   ```bash
   npm run dev
   ```

## 📝 Hướng dẫn sử dụng

1. **Đăng nhập:** Truy cập `localhost:3000` và sử dụng tài khoản admin để đăng nhập.
2. **Tiếp nhận:** Thêm mới bệnh nhân tại mục "Bệnh nhân" và tạo phiếu khám.
3. **Kê đơn:** Trong chi tiết bệnh nhân, chọn "Tạo đơn thuốc", hệ thống sẽ gợi ý thuốc và liều lượng dựa trên cân nặng.
4. **Thống kê:** Xem tổng quan tình hình phòng khám tại trang "Thống kê".

---

**Copyright 2026 Nguyễn Duy Trường**
