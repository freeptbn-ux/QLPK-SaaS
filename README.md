# QLPK-SaaS — Hệ Thống Quản Lý Phòng Khám SaaS Multi-Tenant

QLPK-SaaS là giải pháp phần mềm quản lý phòng khám tư nhân hiện đại, linh hoạt và tối ưu theo mô hình SaaS (Multi-tenant). Hệ thống hỗ trợ toàn diện các quy trình làm việc của phòng khám: từ đón tiếp bệnh nhân, khám bệnh, kê đơn thuốc tự động tích hợp trợ lý AI tra cứu liều dùng, quản lý kho thuốc 3 trạng thái đến báo cáo thống kê doanh thu trực quan.

---

## 🌟 Tính Năng Nổi Bật

- **🏥 Quản Lý Bệnh Nhân & Hồ Sơ Y Tế**:
  - Tiếp nhận bệnh nhân nhanh chóng, hỗ trợ tìm kiếm thông minh (không dấu, mã BN, số điện thoại).
  - Quản lý lịch sử khám bệnh, chẩn đoán, tiền sử bệnh và sinh hiệu.
  - Hỗ trợ thao tác gọi điện trực tiếp từ thẻ liên hệ (`tel:`) mượt mà trên thiết bị di động.

- **💊 Quản Lý Kho Thuốc & Tồn Kho 3 Trạng Thái**:
  - Phân loại trực quan tình trạng tồn kho: **Đã hết** (Đỏ), **Sắp hết** (Cam/Vàng), **Còn hàng** (Xanh).
  - Hỗ trợ nhập kho, điều chỉnh số lượng tồn, cài đặt ngưỡng cảnh báo tối thiểu cho từng loại thuốc.
  - Hỗ trợ nhập giá thuốc và số lượng chính xác với định dạng số thập phân.

- **📋 Tra Cứu Lịch Sử Dùng Thuốc Trực Tiếp Khi Kê Đơn (Modal Dialog)**:
  - Tích hợp nút "Lịch sử dùng thuốc" ngay trên màn hình kê đơn thuốc (`PrescriptionForm`) bên cạnh nút "Tính liều nhanh".
  - Cho phép bác sĩ tra cứu ngay các thuốc bệnh nhân đã dùng nhiều nhất trong quá khứ mà không làm mất trạng thái hay dữ liệu bản nháp của đơn thuốc hiện tại.
  - Tìm kiếm nhanh tên thuốc và quy cách đóng gói (hỗ trợ tiếng Việt không dấu) với cơ chế debounced lọc tức thì.

- **🤖 Trợ Lý Kê Đơn Thuốc AI (Gemini 2.5 Flash-Lite)**:
  - Tự động tra cứu liều dùng gợi ý theo độ tuổi (người lớn/trẻ em) và cân nặng.
  - Sử dụng kiến trúc 2 bước (Search + Structured Output JSON) đảm bảo dữ liệu chính xác và chuẩn hóa.
  - Cảnh báo liều tối đa và tương tác thuốc.

- **⚡ Tối Ưu Hóa Hiệu Năng & Độ Trễ Vercel ↔ Supabase**:
  - Khử trùng lặp xác thực phiên (Auth Deduplication): gom `supabase.auth.getUser()` thành 1 lần gọi duy nhất trong Proxy/Middleware, cắt giảm 150ms - 300ms network round-trip.
  - Đồng bộ Region Vercel Serverless Function sang khu vực Singapore (`sin1`), cùng datacenter với Supabase Database giúp giảm thiểu tối đa ping mạng.

- **📊 Thống Kê & Báo Cáo Trực Quan**:
  - Theo dõi tổng quan lượt khám, doanh thu phòng khám theo ngày, tuần, tháng, năm.
  - Biểu đồ phân tích cơ cấu độ tuổi, giới tính và khu vực địa lý của bệnh nhân.
  - Báo cáo chi tiết top thuốc tiêu thụ nhiều nhất.

- **🔒 Bảo Mật & Phân Tách Dữ Liệu Nâng Cao**:
  - Áp dụng Row Level Security (RLS) trên PostgreSQL cho phép phân tách dữ liệu tuyệt đối giữa các phòng khám (Multi-tenant).
  - Xác thực người dùng an toàn qua Supabase Auth.
  - Content Security Policy (CSP) chặt chẽ với cryptographic nonce bảo vệ chống XSS.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & Motion**: TailwindCSS v4, Framer Motion, React Icons, Recharts
- **Backend & Database**: Supabase (PostgreSQL 17, RLS, PL/pgSQL Stored Procedures / RPCs), Server Actions
- **Form & Validation**: React Hook Form, Zod Schema Validation
- **AI Engine**: Google Gemini 2.5 Flash-Lite
- **Testing**: Vitest, React Testing Library, Playwright

---

## 📁 Cấu Trúc Thư Mục

```
QLPK-SaaS/
├── .brain/                     # Eternal context & log quản lý session
├── docs/                       # Tài liệu kiến trúc, API specification, báo cáo audit
├── plans/                      # Kế hoạch phát triển tính năng (Phase plans)
├── public/                     # Tài nguyên tĩnh (Hình ảnh, favicon)
├── scripts/                    # Scripts tự động hóa (cập nhật năm copyright tự động)
├── src/
│   ├── actions/                # Next.js Server Actions (thuốc, bệnh nhân, thống kê)
│   ├── app/                    # Next.js App Router (Trang ứng dụng & API routes)
│   ├── components/             # React components
│   │   ├── features/           # Components tính năng (thuốc, bệnh nhân, kê đơn, thống kê)
│   │   └── ui/                 # Reusable UI Base Components (Modal, Button, Pagination)
│   ├── hooks/                  # Custom React Hooks
│   ├── lib/                    # Thư viện tiện ích (Supabase client, helpers, error handler)
│   ├── types/                  # Định nghĩa TypeScript Types
│   └── proxy.ts                # Next.js Request Proxy & Route Guard (tối ưu Auth)
├── supabase/
│   └── migrations/             # SQL Migrations cho Supabase DB (RLS, RPCs, Schema)
├── tests/                      # Suites kiểm thử tự động (Vitest)
├── vercel.json                 # Cấu hình Region Serverless Function (sin1)
├── package.json
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Tiền Đề
- **Node.js**: `>= 18.x` (khuyến nghị Node 20.x trở lên)
- **npm** / **yarn** / **pnpm**
- **Supabase Project**: Tài khoản Supabase đã khởi tạo project PostgreSQL.

### Các Bước Cài Đặt

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
   Tạo file `.env.local` tại thư mục gốc dựa theo mẫu từ `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEYS=your-gemini-api-key
   ```

4. **Khởi tạo Cơ Sở Dữ Liệu**:
   Thực thi các file migration trong thư mục `supabase/migrations/` trên Supabase SQL Editor để cấu hình Schema, RLS và các hàm RPC.

5. **Chạy ứng dụng ở môi trường phát triển (Development)**:
   ```bash
   npm run dev
   ```
   Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`.

6. **Kiểm thử & Đóng gói (Build)**:
   ```bash
   # Chạy toàn bộ unit & integration tests
   npm run test

   # Build bản production (tự động chạy prebuild script cập nhật năm copyright)
   npm run build

   # Khởi chạy server production
   npm run start
   ```

---

## 📖 Hướng Dẫn Sử Dụng Tính Năng Chính

1. **Đón tiếp & Quản lý Bệnh nhân (`/patients`)**:
   - Nhập thông tin bệnh nhân mới (Họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ, tiền sử bệnh).
   - Tìm kiếm nhanh bệnh nhân theo từ khóa không dấu, lọc theo lịch hẹn.
   - Nhấp vào bệnh nhân để xem toàn bộ lịch sử các lần khám trước đó.

2. **Kê đơn thuốc thông minh (`/patients/[id]/prescribe`)**:
   - Nhập chẩn đoán và cân nặng của bệnh nhân.
   - Bấm **"Lịch sử dùng thuốc"** để xem danh sách các loại thuốc bệnh nhân từng được kê nhiều nhất trong quá khứ mà không làm mất dữ liệu đang nhập.
   - Bấm **"Tính liều nhanh"** để mở công cụ hỗ trợ liều lượng theo cân nặng và lứa tuổi.
   - Tra cứu thuốc qua ô tìm kiếm tự động, xem giá và tồn kho tức thời.
   - Bấm **"Copy Prompt AI"** để sao chép dữ liệu tra cứu tương tác thuốc và liều lượng chuẩn từ AI.

3. **Quản lý Kho thuốc (`/medicines`)**:
   - Theo dõi trạng thái tồn kho 3 màu: Còn hàng, Sắp hết, Đã hết.
   - Nhập kho, xuất kho và cập nhật giá bán (hỗ trợ số thập phân chính xác).
   - Cài đặt ngưỡng tồn kho tối thiểu để nhận cảnh báo kịp thời.

4. **Báo cáo & Thống kê (`/statistics`)**:
   - Xem tổng quan doanh thu phòng khám, số lượt khám trong ngày, tuần, tháng.
   - Biểu đồ phân tích độ tuổi, giới tính và top thuốc kê nhiều nhất.

---

## 📜 Bản Quyền

Copyright {this_year} Nguyễn Duy Trường
