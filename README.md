# 🏥 QLPK-SaaS — Hệ thống Quản lý Phòng khám Hiện đại & Tối ưu

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%204-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20%26%20Postgres-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-76E2FF?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![AI-Powered](https://img.shields.io/badge/AI-Gemini%202.5%20Flash--lite-orange?style=for-the-badge&logo=googlegemini)](https://deepmind.google/technologies/gemini/)

QLPK-SaaS là giải pháp phần mềm quản lý phòng khám (Clinic Management System) toàn diện được thiết kế theo mô hình **SaaS (Software as a Service)** hiện đại. Hệ thống hướng đến tối ưu hóa toàn bộ quy trình vận hành từ tiếp đón bệnh nhân, khám bệnh, kê đơn thuốc thông minh được hỗ trợ bởi trí tuệ nhân tạo (AI), quản lý kho dược cho đến phân tích báo cáo doanh thu động với tính bảo mật cao và hiệu năng vượt trội.

---

## 🎨 Kiến trúc & Công nghệ Sử dụng

Dự án được xây dựng dựa trên các tiêu chuẩn công nghệ hiện đại nhất hiện nay:

| Công nghệ | Vai trò & Tính năng chính | Phiên bản |
| :--- | :--- | :--- |
| **Next.js** | Core framework sử dụng App Router, Server Actions và tối ưu hóa SEO hoàn hảo. | `16.2.4` |
| **React** | Thư viện giao diện với cơ chế Concurrent Mode, hooks mới nhất. | `19.2.4` |
| **Tailwind CSS** | Thiết kế giao diện responsive cực nhanh, giao diện hiện đại thời thượng. | `4.2.4` |
| **Supabase** | Cơ sở dữ liệu PostgreSQL mạnh mẽ tích hợp Realtime, Storage và Authentication. | `2.104.0` |
| **Google Gemini AI** | Tích hợp model `gemini-2.5-flash-lite` phục vụ tính năng tra cứu liều dùng thuốc tự động qua kiến trúc 2 bước (Search + Format). | `2.5-flash-lite` |
| **Framer Motion** | Tạo hiệu ứng micro-animations mượt mà, tăng trải nghiệm người dùng cao cấp. | `12.38.0` |
| **Vitest** | Framework kiểm thử hiệu năng cao dùng cho Unit Test và Integration Test. | `4.1.5` |
| **Database Engines** | Tối ưu hóa thống kê qua Rollup tables (`clinic_daily_stats`) và Postgres Triggers tự động. | *PostgreSQL* |

---

## ✨ Các Tính năng Nổi bật

### 1. Quản lý Hồ sơ Bệnh nhân Thông minh
* Tìm kiếm nhanh chóng, lọc động theo Tên hoặc Số điện thoại.
* Quản lý thông tin chi tiết lịch sử khám bệnh, cân nặng, tiền sử dị ứng thuốc và các chỉ số sinh tồn (huyết áp, nhiệt độ, nhịp tim).
* Tự động chuẩn hóa định dạng ngày sinh (DOB) và đồng bộ thông tin thời gian thực.

### 2. Kê đơn & Quản lý Kho thuốc Tích hợp AI 🤖
* **AI-Assisted Dosage Lookup**: Tự động tra cứu liều dùng thuốc phù hợp cho trẻ em và người lớn sử dụng mô hình Google Gemini AI tối tân. Hệ thống tự động phân tích độ tuổi, cân nặng và tham chiếu các Dược thư Quốc gia danh tiếng để đưa ra đề xuất chính xác nhất dạng cấu trúc JSON sạch.
* **Kiểm tra Tồn kho Tự động**: Hệ thống tự động trừ kho vật lý ngay khi hoàn thành đơn thuốc, đánh dấu cảnh báo thuốc sắp hết hạn hoặc dưới mức tối thiểu thông qua API RPC bảo mật.
* **Sao chép Prompt Nghiên cứu lâm sàng**: Nút "Copy prompt" tiện lợi cho phép bác sĩ nhanh chóng trích xuất dữ liệu lâm sàng để tham khảo ý kiến chuyên gia AI hoặc lưu trữ hồ sơ.

### 3. Thống kê Doanh thu & Báo cáo Dashboard Động
* Biểu đồ trực quan sinh động sử dụng thư viện **Recharts** hiện đại.
* Theo dõi doanh thu thực tế, số lượng lượt khám, xu hướng phân loại bệnh theo ngày/tuần/tháng/năm.
* Sử dụng bảng tổng hợp Rollup `clinic_daily_stats` kết hợp DB Triggers giúp truy vấn thống kê ngay lập tức mà không làm chậm hệ thống khi lượng dữ liệu lớn.

### 4. Bảo mật Đa phòng khám (SaaS Multi-tenant)
* Cơ chế phân quyền cấp hàng **RLS (Row Level Security)** chặt chẽ của PostgreSQL.
* Mỗi phòng khám được phân tách hoàn toàn về mặt vật lý dữ liệu; bác sĩ/nhân viên của phòng khám này tuyệt đối không thể truy cập dữ liệu của phòng khám khác.
* Quản lý phiên làm việc bảo mật cao với Supabase Auth & Next.js Middlewares.

---

## 📁 Cấu trúc Thư mục Dự án

```text
QLPK-SaaS-main/
├── .github/                  # Github workflows & CI/CD tự động hóa
├── .brain/                   # Hệ tri thức Eternal Context phục vụ phát triển
├── public/                   # Tài sản tĩnh (Hình ảnh, logo, fonts)
├── supabase/                 # Tài nguyên database (Migrations, RLS policies, Triggers)
│   └── migrations/           # Các file SQL thay đổi cấu trúc DB theo thời gian
├── src/
│   ├── app/                  # App Router: Layouts, Pages, API Routes chính
│   │   └── api/
│   │       └── medicine-dosage/ # API tích hợp Gemini AI tra cứu liều lượng thuốc
│   ├── actions/              # Server Actions thực thi logic phía Server (Medicines, Patients, Billing)
│   ├── components/           # Các Component UI tái sử dụng (Feature-based & Common)
│   │   ├── features/         # Components nghiệp vụ (Prescriptions, Medicines, Patients)
│   │   └── ui/               # Base components nguyên bản (Button, Input, Badge, Dialog)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Cấu hình Supabase Client, helpers dùng chung
│   └── types/                # TypeScript type definitions
├── tests/                    # Thư mục chứa các file Unit / Integration / E2E Tests
├── package.json              # Cấu hình scripts & dependencies dự án
└── tsconfig.json             # Cấu hình TypeScript compile
```

---

## 🛠 Hướng dẫn Cài đặt & Khởi chạy Nhanh

### Yêu cầu Hệ thống
* **Node.js**: Phiên bản `18.x` hoặc mới hơn.
* **npm / yarn**: Công cụ quản lý package tiêu chuẩn.

### Các Bước Cài đặt

1. **Clone mã nguồn**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**:
   Tạo file `.env` ở thư mục gốc dựa theo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Sau đó mở file `.env` và điền đầy đủ các khóa truy cập:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   GEMINI_API_KEYS=key1,key2,... # Danh sách API Key Gemini (phân cách bằng dấu phẩy)
   ```

4. **Triển khai Database Migrations**:
   Triển khai cấu trúc bảng, RLS, Triggers và RPC bằng cách áp dụng các tệp migration trong thư mục `supabase/migrations/` vào Supabase SQL Editor của bạn.

5. **Khởi chạy môi trường Phát triển (Development)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

6. **Chạy Tests kiểm thử chất lượng**:
   ```bash
   npm run test
   ```

---

## 📝 Thông tin Bổ sung & Quy chuẩn Vận hành

### Tối ưu hóa API & An toàn Dữ liệu
* **Không lưu trữ khóa API**: Ứng dụng tích hợp hệ thống kiểm tra và loại bỏ hoàn toàn các API key rò rỉ. Biến môi trường `GEMINI_API_KEYS` được quản lý độc quyền ở phía máy chủ (Server-side) thông qua Server Actions và Next.js API Routes, tuyệt đối không lộ ra phía Client.
* **In đơn thuốc linh hoạt**: Hệ thống hỗ trợ định dạng in chuẩn y tế, tương thích tốt với cả máy in laser văn phòng (khổ A4/A5) và các dòng máy in nhiệt mini cầm tay (khổ K80).
* **Tuân thủ quy chuẩn y khoa**: Các tính năng kê đơn thuốc tuân thủ hướng dẫn của Bộ Y tế Việt Nam về định danh thuốc, hoạt chất và biệt dược.

---

## 🛡 Bản quyền & Sở hữu

Copyright {this_year} Nguyễn Duy Trường

*Tất cả các quyền được bảo lưu. Dự án được phát triển và vận hành chuyên nghiệp bởi Nguyễn Duy Trường và các cộng sự lâm sàng.*
