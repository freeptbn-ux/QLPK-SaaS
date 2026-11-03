# QLPK-SaaS — Hệ Thống Quản Lý Phòng Khám Đa Khoa SaaS Multi-Tenant

**QLPK-SaaS** là nền tảng quản lý phòng khám tư nhân hiện đại, linh hoạt và bảo mật cao, được thiết kế theo kiến trúc **Multi-Tenant (Đa phòng khám)** toàn diện. Hệ thống số hóa và tự động hóa toàn bộ quy trình vận hành phòng khám: tiếp đón và quản lý hồ sơ bệnh nhân, kê đơn thuốc thông minh với trợ lý AI (Google Gemini), quản lý kho dược phẩm theo 3 trạng thái tồn kho trực quan, hệ thống báo cáo - phân tích doanh thu hiệu năng cao, cùng bộ công cụ sao lưu và khôi phục dữ liệu độc lập.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🏥 Tiếp Đón & Quản Lý Hồ Sơ Bệnh Nhân
- **Tiếp nhận nhanh chóng**: Khởi tạo và cập nhật hồ sơ bệnh nhân với thông tin hành chính, sinh hiệu (huyết áp, mạch, nhiệt độ, nhịp thở), tiền sử bệnh lý và chẩn đoán ban đầu.
- **Tìm kiếm thông minh**: Hỗ trợ tìm kiếm theo tên không dấu, mã bệnh nhân, hoặc số điện thoại với chỉ mục Trigram (`pg_trgm`) và `unaccent`.
- **Gọi điện trực tiếp (`tel:`)**: Tích hợp liên kết gọi nhanh từ thẻ bệnh nhân trên cả giao diện Desktop (bảng) và Mobile (cards), ngăn chặn sự kiện click lan truyền (`e.stopPropagation`).
- **Cách ly dữ liệu đa khách thuê tuyệt đối (P0)**: Phân tách dữ liệu bệnh nhân nghiêm ngặt giữa các phòng khám; độc lập hóa chỉ mục ràng buộc duy nhất theo `(clinic_id, LOWER(name_normalized), dob)`.

### 2. 💊 Quản Lý Kho Dược & Tồn Kho 3 Trạng Thái
- **Phân loại trực quan 3 màu sắc**:
  - 🔴 **Đã hết hàng** (`stock_quantity = 0`): Khóa chọn thuốc khi kê đơn, hiển thị nhãn cảnh báo đỏ.
  - 🟡 **Sắp hết hàng** (`stock_quantity <= min_stock_level`): Cảnh báo ngưỡng tồn kho an toàn để bổ sung kịp thời.
  - 🟢 **Còn hàng**: Đầy đủ số lượng khả dụng.
- **Lọc và phân trang Server-side (P2)**: Cột ảo `is_low_stock` dạng `GENERATED ALWAYS AS (stock_quantity > 0 AND stock_quantity <= min_stock_level) STORED` cùng partial indexes giúp lọc và tính tổng số trang chính xác tuyệt đối từ cơ sở dữ liệu.
- **Hỗ trợ định dạng số thập phân**: Cho phép nhập giá bán và số lượng chính xác cao cho từng loại thuốc.
- **Tự động trừ kho & hoàn kho nguyên tử**: Quản lý xuất kho tức thời khi kê đơn và hoàn kho tự động khi hủy/xóa đơn thuốc với khóa giao dịch an toàn.

### 3. 📋 Kê Đơn Thuốc Nguyên Khối & Tra Cứu Lịch Sử
- **Tối ưu hóa Autocomplete Thuốc (P1)**:
  - Khử tải 1.000 thuốc lên RAM client; chuyển sang tìm kiếm phía Server (`search_medicines_v2`) giới hạn $\le 20$ kết quả.
  - Hỗ trợ tiếng Việt có dấu và không dấu bằng `pg_trgm` + `unaccent`.
  - Tích hợp Sequence ID ngăn chặn triệt để Race Condition khi bác sĩ gõ phím nhanh.
- **Modal "Lịch sử dùng thuốc"**: Tra cứu ngay các loại thuốc bệnh nhân từng sử dụng nhiều nhất trong quá khứ ngay trên form kê đơn mà không làm mất bản nháp hiện tại.
- **Atomic Prescription RPC (P1)**: Hợp nhất header, details và rollup thống kê trong 1 giao dịch database duy nhất, xóa bỏ hoàn toàn bão trigger cascade (Trigger Storm).
- **Bộ nhớ đệm Presets (P2)**: Tái sử dụng `getCachedSettings()` chia sẻ chung React request cache, tiết kiệm 1 round-trip database mỗi lượt mở trang kê đơn.

### 4. 🤖 Trợ Lý Kê Đơn AI (Google Gemini 2.5 Flash-Lite)
- **Tính liều chuẩn hóa**: Đề xuất liều dùng theo lứa tuổi (người lớn/trẻ em), cân nặng và triệu chứng.
- **Kiến trúc 2 bước (Two-Step Flow)**:
  1. *Tra cứu*: Tìm kiếm thông tin thực tế qua Google Search grounding.
  2. *Định dạng*: Chuyển đổi dữ liệu chuẩn hóa sang JSON Schema an toàn.
- **Bảo mật AI**: Kiểm duyệt đầu vào qua Zod, phòng chống Prompt Injection, Rate Limit tự động xoay vòng API Keys qua biến môi trường `GEMINI_API_KEYS`.

### 5. 📊 Báo Cáo & Phân Tích Hiệu Năng Cao
- **Consolidated Dashboard (P1)**: Gom 14 query riêng lẻ thành 1 RPC `get_dashboard_statistics_v2`, tải toàn bộ biểu đồ và chỉ số KPI dưới 100ms.
- **Phân tích đa chiều**: Thống kê doanh thu theo ngày/tuần/tháng, cơ cấu độ tuổi và giới tính bệnh nhân, bảng xếp hạng thuốc tiêu thụ nhiều nhất.
- **KPI CountUp mượt mà (P2)**: Cập nhật trực tiếp qua DOM ref `textContent` và singleton `Intl.NumberFormat`, loại bỏ hoàn toàn 60-120 re-renders/giây trên Main Thread.

### 6. ⚡ Tối Ưu Hạ Tầng, RLS & Bảo Mật
- **Căn chỉnh Vercel Region `icn1` (P1)**: Đặt Serverless Functions tại Seoul cùng vị trí với Supabase Database (`ap-northeast-2`), cắt giảm 60-80ms RTT mỗi request.
- **Khử trùng lặp Auth (P1)**: Ưu tiên đọc `app_metadata.clinic_id` trong `getAuthUser()`, loại bỏ N+1 query lặp lại vào bảng `profiles`.
- **Hợp nhất Permissive RLS Policies (P2)**: Tách quyền quản trị sang `INSERT/UPDATE/DELETE`, giữ 1 policy `SELECT` duy nhất và chuẩn hóa `(select auth.uid())`, đưa số cảnh báo linter về 0.
- **Dọn dẹp B-tree Index trùng lặp (P2)**: Xóa index `idx_prescriptions_patient_date_desc` thừa trên `prescriptions_header`, giảm tải IOPS ghi đĩa và kích thước WAL.
- **Bộ công cụ sao lưu & khôi phục database**: Scripts `backup_supabase.js` và `restore_supabase.js` hỗ trợ snapshot 13 bảng cơ sở dữ liệu về máy cục bộ kèm chế độ `--dry-run`.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành Phần | Công Nghệ & Thư Viện |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), TypeScript |
| **Giao Diện & Hiệu Ứng** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion 12](https://www.framer.com/motion/), [React Icons](https://react-icons.github.io/react-icons/), [Recharts](https://recharts.org/) |
| **Backend & Cơ Sở Dữ Liệu** | [Supabase](https://supabase.com/) (PostgreSQL 17, RLS, Stored Procedures, PL/pgSQL RPCs), Next.js Server Actions |
| **AI Engine** | [Google Gemini 2.5 Flash-Lite](https://ai.google.dev/) (Two-Step Architecture: Search + Format) |
| **Xử Lý Biểu Mẫu & Xác Thực** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Kiểm Thử (Testing)** | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/) |
| **Hạ Tầng Triển Khai** | [Vercel](https://vercel.com/) (Region `icn1` - Seoul), GitHub Actions |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
QLPK-SaaS/
├── .brain/                     # Eternal Memory & Context Management (AWF 2.0)
│   ├── brain.json              # Static knowledge (kiến trúc, bảng, gotchas)
│   ├── session.json            # Dynamic session context & current tasks
│   ├── handover.md             # Tài liệu chuyển giao nhanh cho session tiếp theo
│   └── session_log.txt         # Append-only log chi tiết tiến độ
├── docs/                       # Tài liệu thiết kế kỹ thuật, API docs, audit report
│   ├── api/endpoints.md        # Danh mục API & RPC endpoints
│   ├── architecture/           # Kiến trúc hệ thống & data flow
│   └── BRIEF.md                # Tóm tắt nghiệp vụ & định hướng
├── plans/                      # Master plan & chi tiết từng Phase tối ưu
│   └── 20261102-p0-p1-performance-hardening/
├── public/                     # Tài nguyên tĩnh (ảnh, icons)
├── scripts/                    # Scripts tiện ích & công cụ sao lưu
│   ├── backup_supabase.js      # Công cụ snapshot toàn bộ database về máy cục bộ
│   ├── restore_supabase.js     # Công cụ khôi phục database độc lập
│   └── update-readme-year.js   # Script cập nhật năm bản quyền tự động
├── src/
│   ├── actions/                # Next.js Server Actions (medicines, patients, settings, statistics)
│   ├── app/                    # App Router (Dashboard, Medicines, Patients, Statistics, APIs)
│   ├── components/             # React Components
│   │   ├── features/           # Components nghiệp vụ (kê đơn, bệnh nhân, kho thuốc, biểu đồ)
│   │   ├── medicines/          # Skeletons & bảng thuốc
│   │   ├── prescriptions/      # MedicineAutocomplete & liều dùng
│   │   └── ui/                 # Reusable UI Base Components (Modal, Button, Toast, Input, CountUp)
│   ├── contexts/               # React Context Providers (SettingsContext memoized)
│   ├── theme/                  # Theme Context & chế độ Dark/Light
│   ├── hooks/                  # Custom React Hooks (useToast, useMedicineDosage)
│   ├── lib/                    # Core utilities (Supabase client/server, normalize, validations)
│   └── types/                  # TypeScript interface definitions (database, forms)
├── supabase/
│   └── migrations/             # SQL Migration Scripts (RLS, Trigram, Stored Procedures)
├── tests/                      # Automated Test Suites (Vitest)
│   ├── p2-medium-performance.test.ts # Bộ kiểm thử xác thực 8 lỗi Medium (P2)
│   └── phase-03-prescription-triggers.test.ts
├── audit.11.2026.md            # Báo cáo kiểm toán hiệu năng toàn diện (P0, P1, P2)
├── CHANGELOG.md                # Nhật ký phát hành & thay đổi
├── vercel.json                 # Cấu hình Vercel Region (icn1 - Seoul)
├── package.json
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `>= 18.x` (khuyến nghị Node `20.x` LTS hoặc mới hơn)
- **Trình quản lý gói**: `npm` hoặc `pnpm`
- **Tài khoản Supabase**: Đã khởi tạo dự án PostgreSQL 17.

### Các Bước Triển Khai Cục Bộ

1. **Clone repository**:
   ```bash
   git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
   cd QLPK-SaaS
   ```

2. **Cài đặt các gói phụ thuộc**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**:
   Sao chép tệp mẫu `.env.example` thành `.env.local` và điền thông tin:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEYS=your-gemini-api-key-1,your-gemini-api-key-2
   ```

4. **Khởi tạo và Di chuyển Dữ liệu (Migrations)**:
   Áp dụng các tệp migration trong thư mục `supabase/migrations/` thông qua Supabase CLI hoặc SQL Editor để khởi tạo bảng, RLS và các hàm RPC.

5. **Khởi chạy máy chủ phát triển (Development)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: `http://localhost:3000`.

6. **Chạy Kiểm thử (Testing)**:
   ```bash
   npm run test
   ```

7. **Sao lưu & Khôi phục Cơ sở Dữ liệu**:
   ```bash
   # Sao lưu 100% database về máy cục bộ
   npm run db:backup

   # Khôi phục dữ liệu ở chế độ chạy thử nghiệm an toàn
   npm run db:restore -- --dry-run
   ```

8. **Đóng gói Production (Build)**:
   ```bash
   # Tự động cập nhật năm bản quyền và biên dịch Next.js
   npm run build

   # Khởi chạy bản production
   npm run start
   ```

---

## 📖 Hướng Dẫn Sử Dụng Các Phân Hệ Chính

1. **Phân hệ Tiếp đón & Bệnh nhân (`/patients`)**:
   - Thêm mới bệnh nhân với định dạng chuẩn hóa họ tên và ngày sinh.
   - Tìm kiếm nhanh bệnh nhân không dấu, xem hồ sơ bệnh án và lịch sử khám.
   - Thao tác gọi điện nhanh bằng liên kết `tel:` trực tiếp trên bảng dữ liệu.

2. **Phân hệ Kê đơn thuốc (`/patients/[id]/prescribe`)**:
   - Nhập chẩn đoán và sinh hiệu của bệnh nhân.
   - Sử dụng ô tìm kiếm thuốc tự động (Server-side debounced) để thêm thuốc vào đơn; hệ thống tự động cảnh báo và chặn thêm các thuốc đã hết hàng.
   - Bấm nút **"Lịch sử dùng thuốc"** để tham khảo nhanh các đơn thuốc trước đó của bệnh nhân mà không làm mất bản nháp hiện tại.
   - Sử dụng công cụ **"Tính liều nhanh"** hoặc **"Copy Prompt AI"** để nhận gợi ý liều lượng an toàn từ trợ lý ảo Gemini.

3. **Phân hệ Quản lý Kho Dược (`/medicines`)**:
   - Quản lý danh mục thuốc, quy cách đóng gói, giá nhập/bán (hỗ trợ số lẻ thập phân).
   - Kiểm soát tồn kho thông qua 3 màu trạng thái trực quan: Còn hàng, Sắp hết, Hết hàng với bộ lọc URL searchParams và phân trang chuẩn server.
   - Nhập thêm số lượng hoặc điều chỉnh tồn kho thủ công kèm ghi chú lý do.

4. **Phân hệ Thống kê & Phân tích (`/statistics`)**:
   - Theo dõi doanh thu phòng khám, số lượng đơn thuốc và lượt bệnh nhân trong ngày/tuần/tháng.
   - Đánh giá cơ cấu nhân khẩu học người bệnh và danh sách các mặt hàng thuốc có lượng tiêu thụ cao nhất.

---

## 📜 Bản Quyền

Copyright 2026 Nguyễn Duy Trường
