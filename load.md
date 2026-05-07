# 🚀 Kế hoạch Tối ưu hóa Tốc độ Load Trang Chi tiết Bệnh nhân

Sau khi phân tích kỹ lưỡng mã nguồn và cấu trúc database, tôi đã xác định được một số điểm nghẽn (bottlenecks) và đề xuất các giải pháp tối ưu hóa như sau.

## 🔍 Phân tích Hiện trạng

1.  **Lặp lại truy vấn nặng**: Trong `src/app/(dashboard)/patients/[id]/page.tsx`, hàm `getPatientById` được gọi 2 lần (một lần trong `generateMetadata` và một lần trong component chính). Mặc dù có dùng `cache` của React, nhưng hàm này đang tải quá nhiều dữ liệu dư thừa cho phần metadata.
2.  **Truy vấn "Cồng kềnh"**: `getPatientById` đang thực hiện JOIN nhiều cấp: `prescriptions_header` -> `prescription_details` -> `medicines`. Việc tải 10 đơn thuốc cùng toàn bộ chi tiết thuốc ngay lập tức làm chậm thời gian phản hồi của Server Component.
3.  **Thiếu Streaming**: Trang hiện tại là một khối Server Component duy nhất. User phải đợi server tải xong toàn bộ (thông tin cá nhân + lịch sử đơn thuốc) mới thấy được gì đó.
4.  **Thiếu Index chuyên biệt**: Database hiện có index lẻ trên `patient_id` và `prescription_date`, nhưng chưa có composite index để tối ưu cho việc lấy "10 đơn thuốc mới nhất của một bệnh nhân".
5.  **Loading UI chưa tối ưu**: Trang đang dùng `loading.tsx` chung của thư mục cha, hiển thị text "Đang tải danh sách bệnh nhân..." không phù hợp với trang chi tiết.

---

## 🛠️ Giải pháp Đề xuất

### 1. Tối ưu hóa Truy vấn & Metadata (High Impact)
*   **Vấn đề**: `generateMetadata` chỉ cần tên bệnh nhân nhưng lại gọi hàm tải toàn bộ dữ liệu.
*   **Giải pháp**: Tách `getPatientById` thành các hàm nhỏ:
    *   `getPatientBasicInfo(id)`: Chỉ lấy `id`, `name`. (Dùng cho Metadata).
    *   `getPatientFullProfile(id)`: Lấy thông tin chi tiết bệnh nhân (cân nặng, bệnh sử...).
    *   `getPatientLatestPrescriptions(id)`: Lấy 10 đơn thuốc mới nhất.
*   **Kết quả**: Metadata sẽ được sinh ra gần như tức thì.

### 2. Triển khai Streaming với React Suspense (Medium Impact)
*   **Vấn đề**: Phần lịch sử đơn thuốc thường nặng hơn phần thông tin cá nhân.
*   **Giải pháp**:
    *   Trong `page.tsx`, bọc component `PrescriptionHistory` vào `<Suspense fallback={<PrescriptionSkeleton />}>`.
    *   Cho phép thông tin cá nhân hiện ra trước, phần lịch sử sẽ "stream" vào sau.
*   **Kết quả**: Cảm giác ứng dụng nhanh hơn (Perceived Performance), user có thể xem thông tin cơ bản ngay lập tức.

### 3. Tối ưu hóa Database (Low Effort, High Impact)
*   **Giải pháp**: Thêm Composite Index trong Postgres:
    ```sql
    CREATE INDEX idx_prescriptions_patient_date 
    ON prescriptions_header (patient_id, prescription_date DESC);
    ```
*   **Kết quả**: Query lấy lịch sử đơn thuốc sẽ chạy nhanh hơn đáng kể khi số lượng đơn thuốc trong hệ thống tăng lên.

### 4. Xây dựng Skeleton UI chuyên biệt (Medium Impact)
*   **Giải pháp**: Tạo file `src/app/(dashboard)/patients/[id]/loading.tsx`.
*   **Thiết kế**: Skeleton nên mô phỏng đúng layout của trang chi tiết (4 cột thông tin, 1 khối lịch sử) để tránh hiện tượng nhảy layout (Layout Shift) khi dữ liệu về.

### 5. Lazy Loading Chi tiết Đơn thuốc (Advanced)
*   **Giải pháp**: Thay vì fetch `prescription_details` ngay trong query đầu tiên, chỉ fetch `prescriptions_header`. Khi user bấm "Mở rộng" một đơn thuốc, lúc đó mới fetch chi tiết thuốc qua một Server Action hoặc API riêng.
*   **Kết quả**: Giảm đáng kể payload ban đầu nếu bệnh nhân có nhiều đơn thuốc phức tạp.

---

## 📈 Kết quả Dự kiến
*   **Time to First Byte (TTFB)**: Giảm ~30-50% nhờ metadata nhẹ hơn.
*   **First Contentful Paint (FCP)**: Giảm ~40% nhờ Streaming.
*   **Trải nghiệm người dùng**: Chuyên nghiệp hơn với Skeleton UI và không còn hiện tượng treo trang khi chuyển hướng.

> [!NOTE]
> Tôi đã phân tích nhưng **chưa thực hiện chỉnh sửa code** theo yêu cầu của bạn. Bạn có thể xem xét các ý tưởng này và cho tôi biết nếu muốn tôi bắt đầu implement phần nào.
