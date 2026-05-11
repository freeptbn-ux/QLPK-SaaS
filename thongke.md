# Báo cáo lỗi Statistics - get_monthly_revenue_total

## 1. Tóm tắt lỗi
- **Loại lỗi:** Runtime Error / Console Error
- **Thông báo lỗi:** `Could not find the function public.get_monthly_revenue_total without parameters in the schema cache`
- **Vị trí:** `src/actions/statistics.ts` tại hàm `getOverviewStats` (dòng 159).
- **Trạng thái:** Hệ thống không tìm thấy hàm RPC `get_monthly_revenue_total` trong Database Supabase.

## 2. Nguyên nhân gốc rễ
Dựa trên lịch sử phát triển và cấu trúc database hiện tại:
1. **Giai đoạn Tối ưu hóa (Phase 04):** Dự án đã thực hiện chuyển đổi các tính toán nặng sang bảng tổng hợp `clinic_daily_stats` để tăng hiệu năng.
2. **Quá trình Dọn dẹp (Purge):** Các hàm database cũ (Legacy Functions) đã bị xóa để tránh dư thừa mã nguồn. Hàm `get_monthly_revenue_total` nằm trong danh sách các hàm bị xóa.
3. **Sơ suất trong Code:** Hàm `getOverviewStats` trong file `src/actions/statistics.ts` vẫn còn sử dụng lệnh gọi `supabase.rpc('get_monthly_revenue_total')` mà chưa được cập nhật sang cách lấy dữ liệu mới từ bảng `clinic_daily_stats`.

## 3. Xác minh kỹ thuật
- **Kiểm tra Database:** Đã thực hiện truy vấn `information_schema.routines`, kết quả cho thấy hàm `get_monthly_revenue_total` hoàn toàn không tồn tại.
- **Dữ liệu thay thế:** Bảng `clinic_daily_stats` đã được tạo và có đầy đủ các cột `total_revenue` và `date` để tính toán doanh thu tháng mà không cần thông qua hàm RPC cũ.

## 4. Giải pháp đề xuất
Cần cập nhật code trong `src/actions/statistics.ts` để lấy doanh thu tháng từ bảng `clinic_daily_stats` thay vì gọi RPC.

**Đoạn code cần sửa (dòng 159):**
```diff
- supabase.rpc('get_monthly_revenue_total'),
+ supabase.from('clinic_daily_stats')
+   .select('total_revenue')
+   .gte('date', startOfMonth)
+   .then(res => ({
+     ...res,
+     data: res.data?.reduce((sum, row) => sum + Number(row.total_revenue), 0) || 0
+   })),
```

---
*Báo cáo được thực hiện bởi Antigravity AI.*
