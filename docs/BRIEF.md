# 💡 BRIEF: QLPK-SaaS (Quản Lý Phòng Khám - SaaS)

**Ngày tạo:** 2026-04-23
**Nguồn gốc:** Migrate từ `quanlyphongkham-Supabase-v2` (Python/PySide6/SQLite)

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

App Desktop Python (PySide6) hiện tại:
- Chỉ chạy được trên 1 máy tính cụ thể
- Phải cài đặt Python + dependencies để chạy
- Không truy cập được từ điện thoại hoặc máy tính khác
- Phụ thuộc vào file `clinic.db` local → rủi ro mất dữ liệu

## 2. GIẢI PHÁP ĐỀ XUẤT

Chuyển đổi sang **Web App SaaS** để:
- Truy cập mọi nơi qua trình duyệt (PC, laptop, điện thoại)
- Dữ liệu lưu trên Supabase (cloud) → an toàn, không sợ mất
- Không cần cài đặt gì - chỉ cần mở link
- Giao diện responsive, dùng được trên cả mobile lẫn desktop

## 3. ĐỐI TƯỢNG SỬ DỤNG

- **Primary:** BS. Nguyễn Duy Trường (chủ phòng khám)
- **Secondary:** Vợ bác sĩ (hỗ trợ vận hành)
- **Quy mô:** 2 người dùng duy nhất → KHÔNG cần multi-tenancy

## 4. QUYẾT ĐỊNH KỸ THUẬT

### Stack công nghệ:
| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| **Frontend** | Next.js | Tối ưu cho Vercel, SSR/SSG, React ecosystem |
| **UI Library** | Material UI (MUI) | Đơn giản, responsive, nhiều component sẵn |
| **Hosting** | Vercel | Deploy dễ, free tier đủ dùng |
| **Database** | Supabase (PostgreSQL) | Auth tích hợp, Realtime, REST API sẵn |
| **Auth** | Supabase Auth | Email + Password đơn giản |

### Supabase Project:
- **Dùng Supabase project MỚI TINH** cho QLPK-SaaS
- Project cũ (`lklemryxamvaarupufco.supabase.co`) vẫn giữ làm backup cho app Python đang hoạt động
- Khi SaaS ổn định → chuyển hoạt động sang, app Python retire

### Không sử dụng:
- ❌ Edge Functions (không cần)
- ❌ Multi-tenancy / Subscription
- ❌ Prescription Images (bỏ hoàn toàn)
- ❌ Bảng `prescriptions` (hình ảnh đơn cũ)
- ❌ Bảng `prescriptions_image`

## 5. DATABASE SCHEMA (Supabase - PostgreSQL)

### Bảng `patients`
| Column | Type | Note |
|--------|------|------|
| id | BIGSERIAL PK | Auto-increment |
| name | TEXT NOT NULL | Tên bệnh nhân |
| dob | TEXT | Ngày sinh (có thể là "13 tháng" hoặc "2024-01-29") |
| gender | TEXT | Giới tính |
| address | TEXT | Địa chỉ |
| phone | TEXT | Số điện thoại |
| weight | TEXT | Cân nặng |
| medical_history | TEXT | Chẩn đoán (legacy format) |
| diagnosis | TEXT | Chẩn đoán mới nhất |
| created_at | TIMESTAMPTZ | Ngày tạo |
| name_normalized | TEXT | Tên không dấu (cho search) |

### Bảng `medicines`
| Column | Type | Note |
|--------|------|------|
| id | BIGSERIAL PK | Auto-increment |
| name | TEXT NOT NULL UNIQUE | Tên thuốc |
| packing_spec | TEXT | Quy cách đóng gói |
| price | REAL DEFAULT 0.0 | Đơn giá |
| stock_quantity | INTEGER DEFAULT 0 | Số lượng tồn kho (**MỚI: sync lên Supabase**) |
| min_stock_level | INTEGER DEFAULT 5 | Ngưỡng cảnh báo hết hàng |

### Bảng `prescriptions_header`
| Column | Type | Note |
|--------|------|------|
| id | BIGSERIAL PK | Auto-increment |
| patient_id | INTEGER FK → patients | Bệnh nhân |
| prescription_date | TIMESTAMPTZ | Ngày kê đơn |
| diagnosis | TEXT | Chẩn đoán cho đơn này |
| total_amount | REAL DEFAULT 0.0 | Tổng tiền |
| notes | TEXT | Ghi chú |

### Bảng `prescription_details`
| Column | Type | Note |
|--------|------|------|
| id | BIGSERIAL PK | Auto-increment |
| prescription_header_id | INTEGER FK → prescriptions_header | Đơn thuốc |
| medicine_id | INTEGER FK → medicines | Thuốc |
| quantity | INTEGER NOT NULL | Số lượng |
| unit_price | REAL | Đơn giá tại thời điểm kê |

### Bảng `settings` (MỚI - cho web config)
| Column | Type | Note |
|--------|------|------|
| key | TEXT PK | Tên cài đặt |
| value | TEXT | Giá trị |

**Settings mặc định:**
- `consultation_fee` = "120" (Phí khám, cấu hình được trên web)
- `doctor_name` = "BS. Nguyễn Duy Trường"
- `clinic_name` = "Phòng khám Nhi khoa"

## 6. TÍNH NĂNG

### 🚀 MVP (Bắt buộc có - Migrate 1:1 từ Python):
- [ ] **Login Page** - Supabase Auth (Email + Password)
- [ ] **Tab Bệnh nhân** - CRUD, tìm kiếm, phân trang, xem chi tiết
- [ ] **Tab Kho thuốc** - CRUD, quản lý tồn kho, cảnh báo sắp hết
- [ ] **Kê đơn thuốc** - Chọn thuốc, nhập liều, auto trừ tồn kho, tính tiền
- [ ] **Tính liều thuốc** - Calculator theo cân nặng/tuổi (Dose Calculator)
- [ ] **Tab Thống kê** - Doanh thu theo ngày/tháng/năm, biểu đồ lượt khám
- [ ] **Cài đặt** - Phí khám, theme (light/dark)
- [ ] **Responsive Design** - Dùng được trên mobile lẫn desktop

### 🎁 Phase 2 (Làm sau nếu cần):
- [ ] PWA (Progressive Web App) - offline support
- [ ] Export báo cáo PDF
- [ ] Backup/Restore data từ web

### ❌ LOẠI BỎ (so với Python app):
- Prescription Images (ảnh đơn thuốc)
- Splash Screen (không cần trên web)
- Sidebar toggle animation (thay bằng responsive nav)
- SQLite local (toàn bộ chuyển sang Supabase PostgreSQL)
- Sync Manager (không cần sync 2 chiều nữa, Supabase là source of truth)
- Debug/Log tab (dùng Vercel logs thay thế)

## 7. DATA MIGRATION

### Dữ liệu cần migrate từ `clinic.db`:
| Bảng | Records | Action |
|------|---------|--------|
| patients | 716 | Push lên Supabase mới |
| medicines | 199 | Push lên Supabase mới (KÈM stock) |
| prescriptions_header | 799 | Push lên Supabase mới |
| prescription_details | 2,463 | Push lên Supabase mới |
| prescriptions | 50 | **BỎ** (ảnh đơn cũ) |
| prescriptions_image | 0 | **BỎ** |

### Lưu ý khi migrate:
- Field `dob` có dạng text không chuẩn ("13 tháng", "6 tuổi") → giữ nguyên dạng TEXT
- Column `prescription_migrated` → **BỎ** (internal flag, không cần trên SaaS)
- Column `stock_quantity`, `min_stock_level` → **GIỮ** và push lên Supabase

## 8. ƯỚC TÍNH SƠ BỘ

- **Độ phức tạp:** Trung bình - Phức tạp
- **Thời gian ước tính:**
  - Setup & Database Schema: 1 ngày
  - Auth + Layout: 1 ngày
  - Patient Module: 2 ngày
  - Medicine Module: 1 ngày
  - Prescription Module: 2 ngày
  - Statistics Module: 2 ngày
  - Settings + Polish: 1 ngày
  - Data Migration Script: 1 ngày
  - **Tổng: ~11 ngày dev**

- **Chi phí vận hành:**
  - Vercel: **Free** (Hobby plan đủ cho 2 users)
  - Supabase: **Free** (Free tier: 500MB DB, 50K auth users, 2GB bandwidth)

## 9. RỦI RO

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| DOB format không chuẩn | Thấp | Giữ dạng TEXT, xử lý display phía frontend |
| Supabase free tier limit | Thấp | 716 patients + 199 medicines rất nhỏ so với 500MB |
| Vercel cold start | Thấp | Next.js SSR giúp giảm thiểu |
| Migration data loss | Trung bình | Backup clinic.db trước khi push, verify sau khi push |

## 10. BƯỚC TIẾP THEO

→ Anh review BRIEF này
→ Nếu OK → Chạy `/plan` để tạo PRD chi tiết + task list
→ Tạo Supabase project mới
→ Chạy migration script
→ Bắt đầu code Next.js
