# API Documentation - QLPK-SaaS

Ngày cập nhật: 2026-05-11
Base URL: `http://localhost:3000`

---

## 💊 Medicine & AI

### POST `/api/medicine-dosage`
Tra cứu thông tin liều dùng thuốc bằng AI (Gemini 2.5 Flash-Lite). Hệ thống sử dụng quy trình 2 bước:
1. **Tra cứu**: Tìm kiếm thông tin thực tế qua Google Search.
2. **Định dạng**: Chuyển đổi dữ liệu thô thành JSON chuẩn.

**Authentication:** Yêu cầu đăng nhập (Supabase Auth).

**Request Body:**
```json
{
  "medicineName": "Atersin"
}
```

**Constraints:**
- Tên thuốc: 2-50 ký tự.
- Chỉ chứa chữ cái, số, khoảng trắng và dấu gạch ngang.
- Chặn các từ khóa injection (ignore, system, instruction).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "medicine_name": "Atersin",
    "adult_dosage": "Uống 10 - 15 mL, 2 - 3 lần mỗi ngày.",
    "children_dosage": "Trẻ em từ 7-15 tuổi: 5-10ml...",
    "usage_instructions": "Dùng đường uống...",
    "description": "Thông tin chi tiết về thuốc..."
  }
}
```

**Errors:**
- `400 Bad Request`: Tên thuốc không hợp lệ hoặc chứa mã độc.
- `401 Unauthorized`: Người dùng chưa đăng nhập.
- `503 Service Unavailable`: Lỗi kết nối API Gemini hoặc hết lượt dùng (Rate Limit).
- `500 Internal Server Error`: Lỗi hệ thống hoặc lỗi parse dữ liệu AI.

---

## 📊 Database RPC Endpoints (Performance Hardened)

### `public.get_dashboard_statistics_v2`
Lấy toàn bộ chỉ số thống kê tổng hợp (KPI, xu hướng doanh thu, cơ cấu độ tuổi/giới tính bệnh nhân, top thuốc kê đơn) trong 1 lần gọi database.

- **Caller:** `src/actions/statistics.ts` -> `getDashboardStatistics()`
- **Security:** Security Definer, tenant isolation theo `p_clinic_id`.
- **Params:** `p_clinic_id BIGINT`, `p_start_date TIMESTAMPTZ`, `p_end_date TIMESTAMPTZ`.

---

### `public.search_medicines_v2`
Tìm kiếm thuốc có phân trang và giới hạn ($\le 20$ kết quả), hỗ trợ tìm kiếm tiếng Việt có dấu và không dấu qua `pg_trgm` + `unaccent`.

- **Caller:** `src/actions/medicines.ts` -> `searchMedicines()`
- **Security:** Security Definer, tenant isolation theo `p_clinic_id`.
- **Params:** `p_clinic_id BIGINT`, `p_query TEXT`, `p_limit INT`, `p_exclude_ids BIGINT[]`.

---

### `public.create_prescription`
Tạo đơn thuốc nguyên khối (prescriptions_header + prescription_details) kèm khóa hàng tồn kho (`FOR NO KEY UPDATE`), cập nhật tồn kho và rollup `clinic_daily_stats` trong một transaction duy nhất.

- **Caller:** `src/actions/prescriptions.ts`
- **Security:** Security Definer, tenant isolation theo `p_clinic_id`.
- **Params:** `p_patient_id`, `p_diagnosis`, `p_items (JSONB)`, `p_notes`, `p_consultation_fee`, `p_clinic_id`, v.v.

---

## 🏗️ Architecture Note: Two-Step AI Flow

Do giới hạn của Gemini API (không thể dùng `google_search` đồng thời với `JSON Mode`), endpoint này thực hiện:
1. `POST .../generateContent` với `tools: [{google_search: {}}]`.
2. Lấy kết quả text, gửi tiếp `POST .../generateContent` với `response_mime_type: "application/json"`.

Điều này đảm bảo dữ liệu luôn **chính xác** (có search) và **ổn định** (đúng JSON schema).
