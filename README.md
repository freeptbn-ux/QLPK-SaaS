# QLPK-SaaS - Hệ Thống Quản Lý Phòng Khám Thông Minh

QLPK-SaaS là giải pháp phần mềm quản lý phòng khám (SaaS) hiện đại, tích hợp trí tuệ nhân tạo (AI) để hỗ trợ bác sĩ và nhân viên y tế trong việc quản lý bệnh nhân, kho thuốc và tra cứu thông tin chuyên môn một cách nhanh chóng, chính xác.

## 🌟 Tính Năng Chính

- **Quản lý Bệnh nhân**: Lưu trữ hồ sơ bệnh án, lịch sử khám bệnh và thông tin liên lạc.
- **Quản lý Kho thuốc**: Theo dõi số lượng tồn kho, giá nhập/bán, hạn sử dụng và lịch sử nhập xuất. Tự động cảnh báo thuốc hết hàng hoặc tồn kho thấp.
- **Tra cứu Liều dùng AI**: Tích hợp Google Gemini AI hỗ trợ tra cứu liều lượng thuốc chuyên sâu, đặc biệt tối ưu cho nhi khoa với khả năng phân cấp nhóm tuổi và bôi đậm tiêu đề thông minh.
- **Tính Liều Nhanh**: Công cụ tính toán liều lượng dựa trên cân nặng và hàm lượng thuốc thực tế.
- **Thống kê & Báo cáo**: Biểu đồ trực quan về doanh thu, số lượng bệnh nhân và tình hình kho dược.
- **Bảo mật Đa lớp**: Áp dụng Row Level Security (RLS) của Supabase, cơ chế AI Safety (2-Step Flow) và validation nghiêm ngặt.

## 🚀 Công Nghệ Sử Dụng

- **Core**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime)
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/) (mô hình `gemini-2.5-flash-lite`) với kiến trúc Search + Format.
- **State Management & Validation**: [Zod](https://zod.dev/) (Schema validation), [React Hook Form](https://react-hook-form.com/)
- **UI/UX**: [Framer Motion](https://www.framer.com/motion/) (Animations), [Lucide React](https://lucide.dev/) (Icons)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Integration Testing/Adversarial Testing)

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
Tạo file `.env` dựa trên mẫu `.env.example`:
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

## 📖 Cách Sử Dụng

1. **Đăng nhập**: Sử dụng tài khoản bác sĩ/nhân viên y tế để truy cập hệ thống.
2. **Quản lý kho**: Cập nhật danh sách thuốc, đơn giá và số lượng tồn kho tối thiểu.
3. **Kê đơn**: 
   - Tìm kiếm thuốc bằng tính năng Autocomplete thông minh.
   - Các thuốc hết hàng sẽ được đánh dấu đỏ và hệ thống sẽ ngăn chặn việc lựa chọn để đảm bảo an toàn.
   - Sử dụng trợ lý AI để tra cứu liều dùng cho các trường hợp khó (đặc biệt là bệnh nhi).
4. **Xem báo cáo**: Theo dõi biểu đồ doanh thu và lượng bệnh nhân tại trang Dashboard.

## 📂 Cấu Trúc Thư Mục

- `src/app`: Chứa các route (Auth, Dashboard), API endpoints và layouts.
- `src/components`: Các component UI, features (Prescriptions, Medicines, Patients).
- `src/lib`: Thư viện cấu hình (Supabase, Gemini), utility functions và validation schemas.
- `src/hooks`: Các custom hooks xử lý logic (ví dụ: `useMedicineDosage`).
- `supabase`: Chứa các file migration và cấu hình database.
- `.brain`: Eternal Context - Lưu trữ kiến thức, phiên làm việc và lịch sử phát triển dự án.
- `plans`: Các kế hoạch phát triển chi tiết cho từng giai đoạn.

## 🔒 Bảo Mật & Lưu Ý

- **Tuyệt đối không** commit các file `.env` chứa API Key lên GitHub.
- Các API Key của Gemini được quản lý thông qua biến môi trường với cơ chế Load Balancing.
- Hệ thống áp dụng kiến trúc 2 bước (Search -> Format) để tránh xung đột giữa công cụ tìm kiếm và định dạng JSON.

## 📝 Bản Quyền

Copyright 2026 Nguyễn Duy Trường

---
*Dự án được phát triển bởi Nguyễn Duy Trường.*
