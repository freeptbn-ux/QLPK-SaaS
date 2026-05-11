# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

QLPK-SaaS là giải pháp phần mềm quản lý phòng khám (SaaS) hiện đại, tích hợp trí tuệ nhân tạo (AI) để hỗ trợ bác sĩ và nhân viên y tế trong việc quản lý bệnh nhân, kho thuốc và tra cứu thông tin chuyên môn một cách nhanh chóng, chính xác.

## 🌟 Tính Năng Chính

- **Quản lý Bệnh nhân**: Lưu trữ hồ sơ bệnh án, lịch sử khám bệnh và thông tin liên lạc.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, giá nhập/bán, hạn sử dụng và lịch sử nhập xuất.
- **Tra cứu Liều dùng AI**: Tích hợp Google Gemini AI để hỗ trợ tra cứu liều dùng thuốc chuẩn xác từ các nguồn uy tín.
- **Thống kê & Báo cáo**: Biểu đồ trực quan về doanh thu, số lượng bệnh nhân và tình hình kho dược.
- **Bảo mật Đa lớp**: Áp dụng Row Level Security (RLS) của Supabase và các lớp validation đầu vào nghiêm ngặt.

## 🚀 Công Nghệ Sử Dụng

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime)
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/) (mô hình `gemini-2.5-flash-lite`)
- **State Management & Validation**: [Zod](https://zod.dev/) (Schema validation), [React Hook Form](https://react-hook-form.com/)
- **UI/UX**: [Framer Motion](https://www.framer.com/motion/) (Animations), [Lucide React](https://lucide.dev/) (Icons)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Integration Testing)

## 🛠️ Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js 18.x trở lên
- Tài khoản Supabase
- Google AI (Gemini) API Key

### 2. Clone repository
```bash
git clone https://github.com/freeptbn-ux/QLPK-SaaS.git
cd QLPK-SaaS
```

### 3. Cài đặt dependency
```bash
npm install
```

### 4. Cấu hình biến môi trường
Tạo file `.env.local` dựa trên mẫu `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEYS=your_gemini_api_key_1,your_gemini_api_key_2
```

### 5. Chạy ứng dụng
```bash
npm run dev
```
Truy cập `http://localhost:3000` để xem kết quả.

## 📂 Cấu Trúc Thư Mục

- `src/app`: Chứa các route, layout và page của Next.js (App Router).
- `src/components`: Các component UI dùng chung.
- `src/lib`: Chứa các thư viện cấu hình (Supabase, AI, Utils).
- `src/validations`: Định nghĩa các schema Zod để kiểm tra dữ liệu.
- `supabase`: Chứa các file migration và cấu hình database.
- `plans`: Tài liệu kế hoạch phát triển và nâng cấp hệ thống.
- `.brain`: Eternal Context - Lưu trữ kiến thức và ngữ cảnh phát triển dự án.

## 🔒 Bảo Mật & Lưu Ý

- **Tuyệt đối không** commit các file `.env`, `.env.local` chứa API Key lên GitHub.
- Các API Key của Gemini được quản lý thông qua biến môi trường và có cơ chế Load Balancing/Failover giữa nhiều key.
- Hệ thống áp dụng cơ chế chặn Prompt Injection ở cả tầng Validation (Zod) và tầng Prompt Engineering.

## 📝 Bản Quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển bởi Nguyễn Duy Trường.*
