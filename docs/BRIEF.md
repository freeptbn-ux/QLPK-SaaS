# 💡 BRIEF: Lịch sử dùng thuốc khi Kê đơn & Tối ưu hiệu năng Vercel ↔ Supabase

**Ngày tạo:** 2026-11-02  
**Mục tiêu:** 
1. Nâng cao trải nghiệm kê đơn bằng cách cho phép bác sĩ xem thống kê thuốc bệnh nhân dùng nhiều nhất trực tiếp trong màn hình kê đơn (Modal Dialog).
2. Tối ưu triệt để độ trễ (latency) mạng giữa Vercel Serverless Functions và Supabase Database bằng cách loại bỏ duplicate auth calls và đồng bộ Region.

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

1. **Khó khăn trong lúc kê đơn:**
   - Khi bác sĩ đang kê đơn mới tại `/patients/[id]/prescribe`, nếu muốn nhớ lại bệnh nhân này trước đây hay đáp ứng thuốc gì hoặc dùng loại thuốc nào nhiều nhất, bác sĩ phải quay lại trang danh sách bệnh nhân hoặc lật từng đơn thuốc cũ.
   - Thao tác chuyển qua lại làm gián đoạn luồng tư duy kê đơn của bác sĩ.

2. **Nghẽn hiệu năng giao tiếp Vercel ↔ Supabase:**
   - **Double Auth Round-Trip:** Trong `src/proxy.ts` (và `src/lib/supabase/proxy.ts`), mỗi request tới các route được bảo vệ đang gọi `supabase.auth.getUser()` tới **2 lần**:
     - Lần 1: Trong `updateSession` để làm mới session cookie.
     - Lần 2: Ở đoạn route guard cuối file `src/proxy.ts`.
     Mỗi lần gọi `getUser()` là một network round-trip độc lập từ Vercel Edge/Serverless sang Supabase Auth server, gây tăng thêm 150ms - 300ms latency không cần thiết.
   - **Mất đồng bộ Region:** Nếu Vercel deploy mặc định ở Bắc Mỹ (`iad1` - Washington D.C) trong khi cơ sở dữ liệu Supabase đặt tại Singapore (`ap-southeast-1` / `sin1`), mỗi Server Action / Query sẽ chịu ping xuyên lục địa (200ms - 400ms).

---

## 2. GIẢI PHÁP ĐỀ XUẤT

### 2.1. Feature: Modal "Lịch sử dùng thuốc" trong Kê đơn (Option A)
- **Vị trí UI:** Đặt nút bấm **"Lịch sử dùng thuốc"** (kèm icon `HiOutlineClipboardDocumentList` hoặc `HiOutlineClock`) cạnh nút **"Tính liều nhanh"** phía trên bảng chọn thuốc trong `PrescriptionForm.tsx`.
- **Tái sử dụng Component:** Tận dụng trực tiếp `MedicineUsageDialog.tsx` đã có sẵn tính năng:
  - Gọi RPC Postgres `get_medicine_usage_by_patient(patient_id)` trả về các thuốc xếp theo số lần kê (`times_prescribed DESC`).
  - Tìm kiếm Debounced Search (300ms).
  - Phân loại / sắp xếp theo tên thuốc hoặc số lần dùng.
  - Hiệu ứng Modal Framer Motion mượt mà, hỗ trợ Dark/Light mode.
- **Phạm vi tác động:** Không làm xáo trộn logic form kê đơn, dễ dàng bật tắt modal độc lập.

### 2.2. Performance: Khử Double Auth & Tối ưu Vercel Region
- **Khử Double Auth trong Proxy:**
  - Hợp nhất việc check user vào một lần duy nhất. Cho phép `updateSession` trả về cả `response` và thông tin `user` (hoặc kiểm tra route guard trực tiếp trong một luồng đồng nhất), loại bỏ hoàn toàn lệnh `getUser()` thứ 2.
- **Cấu hình `vercel.json`:**
  - Thiết lập vùng chạy Serverless Functions của Vercel khớp với Supabase (mặc định đặt `sin1` - Singapore / `ap-southeast-1` cho các phòng khám tại Đông Nam Á / Việt Nam).

---

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Bác sĩ / Dược sĩ phòng khám:** Kê đơn nhanh hơn, chính xác hơn, không bị giật lag khi chuyển trang hoặc tải dữ liệu.

---

## 4. TÍNH NĂNG VÀ PHẠM VI TRIỂN KHAI

### 🚀 MVP (Triển khai ngay):
- [ ] **UI PrescriptionForm:** Thêm button "Lịch sử dùng thuốc" và tích hợp `MedicineUsageDialog` vào `PrescriptionForm.tsx`.
- [ ] **Khử Double Auth trong Proxy:** Tái cấu trúc `src/proxy.ts` và `src/lib/supabase/proxy.ts` để chỉ gọi `supabase.auth.getUser()` đúng 1 lần cho mỗi HTTP request.
- [ ] **Cấu hình Vercel Region:** Tạo/cập nhật `vercel.json` với `regions: ["sin1"]` (hoặc region tương ứng của Supabase).
- [ ] **Kiểm thử:** Chạy bộ test suite hiện có (`npm run test`) đảm bảo không ảnh hưởng middleware security test và luồng kê đơn.

### 🎁 Phase 2 (Nâng cao - Xem xét sau):
- [ ] Tính năng "1-Click Add" (chọn thuốc từ lịch sử để tự động điền vào bảng kê đơn).
- [ ] Triển khai `getClaims()` cho middleware đối với các trang static/public nếu cần tối ưu hơn nữa.

---

## 5. ƯỚC TÍNH SƠ BỘ & RỦI RO
- **Độ phức tạp:** Thấp (🟢 Dễ làm - Tận dụng 100% logic và component đã có).
- **Rủi ro:**
  - Cần cẩn trọng khi sửa middleware proxy để không làm lọt các route được bảo vệ (đã có bộ unit test `src/test/middleware-security.test.ts` để kiểm tra bảo vệ regression).
  - Region Vercel cần khớp với tài khoản Vercel (Hobby plan chỉ hỗ trợ 1 region, Pro hỗ trợ multi-region).

---

## 6. BƯỚC TIẾP THEO
→ Chuyển sang `/plan` để lên chi tiết các bước sửa code, file diff và test plan!
