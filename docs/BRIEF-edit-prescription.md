# 💡 BRIEF: Chức năng Sửa Đơn Thuốc (Edit Prescription)

**Ngày tạo:** 2026-04-26
**Dự án:** QLPK-SaaS (Quản Lý Phòng Khám)

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Hiện tại hệ thống đã có:
- ✅ **Kê đơn mới** (`create_prescription`) — có trừ kho thuốc
- ✅ **Thêm thuốc vào đơn hôm nay** (`append_to_prescription`) — có trừ kho thuốc
- ✅ **Xóa đơn thuốc** (`delete_prescription`) — có bù kho thuốc

**Thiếu:** Chức năng **sửa đơn thuốc đã kê** (bao gồm cả đơn cũ). Khi phát hiện sai sót (số lượng, tên thuốc, chẩn đoán...), người dùng hiện phải xóa rồi kê lại từ đầu.

## 2. GIẢI PHÁP ĐỀ XUẤT

Thêm chức năng **"Sửa đơn thuốc"** trực tiếp trên giao diện lịch sử khám bệnh, cho phép chỉnh sửa mọi đơn thuốc mà không giới hạn thời gian. Hệ thống sẽ tự động đồng bộ kho thuốc khi thay đổi.

## 3. ĐỐI TƯỢNG SỬ DỤNG

- **Primary:** Chủ phòng khám (duy nhất 1 người dùng — dự án private)
- **Permissions:** Bất kỳ ai đăng nhập được đều có quyền sửa

## 4. KIỂM TRA HỆ THỐNG HIỆN TẠI (Audit)

### Kết quả kiểm tra kho thuốc:

| Chức năng | RPC Function | Trừ kho? | Bù kho? | File SQL |
|-----------|-------------|:---:|:---:|----------|
| Kê đơn mới | `create_prescription` | ✅ | — | `002_create_prescription_rpc.sql` (dòng 41-43) |
| Thêm thuốc | `append_to_prescription` | ✅ | — | `002_create_prescription_rpc.sql` (dòng 98-101) |
| Xóa đơn | `delete_prescription` | — | ✅ | `20260426155000_add_delete_prescription_rpc.sql` (dòng 17-19) |
| **Sửa đơn** | **CHƯA CÓ** | ❌ | ❌ | — |

> Hệ thống hiện tại đã xử lý inventory đúng cho tất cả các thao tác đã có. Chỉ cần bổ sung cho thao tác "Sửa đơn".

## 5. PHẠM VI CHỈNH SỬA (SCOPE)

### ✅ Được phép sửa:

| # | Nội dung | Chi tiết |
|---|---------|----------|
| 1 | **Số lượng thuốc** | Tăng/giảm quantity từng item → đồng bộ kho |
| 2 | **Xóa 1 thuốc** khỏi đơn | Bù lại kho cho thuốc bị xóa |
| 3 | **Đổi thuốc** (A → B) | Bù kho A, trừ kho B |
| 4 | **Thêm thuốc mới** vào đơn cũ | Trừ kho thuốc mới thêm |
| 5 | **Ngày kê đơn** (`prescription_date`) | Thay đổi ngày |
| 6 | **Chẩn đoán** (`diagnosis`) | Cập nhật text |
| 7 | **Ghi chú** (`notes`) | Cập nhật text |

### ❌ KHÔNG sửa:
| # | Nội dung | Lý do |
|---|---------|-------|
| 1 | **Phí khám** (`consultation_fee`) | User không cần |

### Quy tắc áp dụng:
- **Không giới hạn thời gian:** Sửa được mọi đơn thuốc (cả đơn cũ)
- **Không cần audit log:** Không ghi lịch sử chỉnh sửa
- **Mọi user đăng nhập đều có quyền sửa**

## 6. QUY TẮC KHO THUỐC (INVENTORY RULES)

### Logic đồng bộ kho khi sửa:

```
Giảm số lượng (10 → 5):  BÙ 5 viên vào kho
Tăng số lượng (5 → 10):  TRỪ thêm 5 viên từ kho
Xóa thuốc khỏi đơn:      BÙ toàn bộ quantity vào kho
Đổi thuốc (A → B):       BÙ kho A + TRỪ kho B
Thêm thuốc mới:          TRỪ kho thuốc mới
```

### Edge case - Kho âm:
- **Cho phép sửa** ngay cả khi kho không đủ (stock_quantity có thể < 0)
- **Hiển thị cảnh báo** trên UI: "⚠️ Kho thuốc [X] sẽ bị âm [Y] sau khi sửa"
- Không chặn thao tác

## 7. ẢNH HƯỞNG CẬP NHẬT

Khi sửa đơn thuốc, cần cập nhật đồng thời:

| Bảng/Trường | Cập nhật gì |
|-------------|-------------|
| `prescription_details` | Thêm/xóa/sửa dòng thuốc |
| `prescriptions_header.total_amount` | Tính lại tổng tiền (tiền thuốc + phí khám cũ) |
| `prescriptions_header.diagnosis` | Cập nhật nếu thay đổi |
| `prescriptions_header.notes` | Cập nhật nếu thay đổi |
| `prescriptions_header.prescription_date` | Cập nhật nếu thay đổi |
| `medicines.stock_quantity` | Đồng bộ theo logic ở mục 6 |
| `patients.diagnosis` | Cập nhật nếu đây là đơn mới nhất |
| `patients.medical_history` | Rebuild text legacy từ đơn được sửa |

## 8. ƯỚC TÍNH SƠ BỘ

- **Độ phức tạp:** 🟡 Trung bình
  - Backend (RPC): Logic khá phức tạp vì phải so sánh old vs new để tính delta kho
  - Frontend: Dialog chỉnh sửa với form cho thuốc + autocomplete
- **Rủi ro:**
  - Tính toán delta kho sai → kho lệch
  - Race condition nếu 2 người sửa cùng lúc (nhưng chỉ 1 user nên OK)

## 9. BƯỚC TIẾP THEO

→ Chạy `/plan` để lên thiết kế chi tiết (SQL RPC + Server Action + UI)
