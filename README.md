# QLPK SaaS - Phần mềm Quản lý Phòng khám Nhi khoa

Dự án QLPK SaaS là một giải pháp quản lý phòng khám hiện đại, được tối ưu hóa cho quy trình khám chữa bệnh tại các phòng khám nhi khoa. Ứng dụng cung cấp đầy đủ các tính năng từ quản lý bệnh nhân, kho thuốc đến kê đơn và thống kê báo cáo.

## 🚀 Tính năng chính

- **Quản lý bệnh nhân:** Lưu trữ thông tin chi tiết, lịch sử khám bệnh và tìm kiếm nhanh chóng.
- **Quản lý kho thuốc:** Quản lý danh mục thuốc, theo dõi tồn kho và cảnh báo khi thuốc sắp hết.
- **Hệ thống kê đơn:** Quy trình kê đơn chuyên nghiệp, hỗ trợ tính toán liều lượng và in đơn thuốc.
- **Thống kê & Báo cáo:** Biểu đồ trực quan về doanh thu, số lượng bệnh nhân và xu hướng sử dụng thuốc.
- **Giao diện hiện đại:** Hỗ trợ Dark Mode, tối ưu hóa cho cả máy tính và thiết bị di động.

## 🛠️ Công nghệ sử dụng

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS v4 (với thiết kế hiện đại, responsive).
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Real-time).
- **Animations:** Framer Motion.
- **Icons:** Lucide React, React Icons.
- **Testing:** Vitest.

## 📂 Cấu trúc thư mục

```text
src/
├── actions/        # Server Actions xử lý logic nghiệp vụ
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # Các thành phần giao diện tái sử dụng
│   ├── ui/         # Thành phần UI cơ bản
│   └── features/   # Thành phần theo tính năng (Patients, Medicines,...)
├── lib/            # Tiện ích và cấu hình chung
├── types/          # Định nghĩa kiểu dữ liệu TypeScript
└── theme/          # Cấu hình theme và context màu sắc
```

## ⚙️ Hướng dẫn cài đặt

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
   Tạo file `.env.local` dựa trên mẫu `.env.example` và điền thông tin Supabase của bạn.

4. **Chạy dự án ở chế độ phát triển:**
   ```bash
   npm run dev
   ```

5. **Build dự án:**
   ```bash
   npm run build
   ```

## 📝 Cách sử dụng

- Đăng nhập vào hệ thống bằng tài khoản được cấp.
- Sử dụng thanh Sidebar để điều hướng giữa các chức năng: Bệnh nhân, Kho thuốc, Thống kê, v.v.
- Các thao tác Thêm/Sửa/Xóa đều được thiết kế dạng Modal/Dialog thuận tiện.

---

**Copyright 2026 Nguyễn Duy Trường**
