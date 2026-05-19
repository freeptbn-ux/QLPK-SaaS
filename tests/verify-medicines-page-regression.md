# Verify `/medicines` Regression

## Precondition
- App chạy ở `http://localhost:3000`.
- User đã đăng nhập.
- User có `profiles.clinic_id` trên Supabase live.
- Migration RPC mới đã apply.

## Browser Test
1. Mở `http://localhost:3000/medicines`.
2. Chờ trang load xong.
3. Kiểm tra không có error overlay Next.js.
4. Kiểm tra không có console error chứa:
   - `P0001`
   - `Not authenticated or clinic_id missing`
   - `get_low_stock_medicines`
5. Kiểm tra danh sách thuốc xuất hiện hoặc empty-state hợp lệ.
6. Kiểm tra khu vực thuốc sắp hết hàng không làm sập trang.

## Supabase Test
1. Inspect `public.get_low_stock_medicines(bigint)`.
2. Confirm function body có membership check.
3. Confirm grants không có `anon`.

## Pass Condition
- `/medicines` render thành công.
- Không còn lỗi server-side từ low-stock RPC.
- Không có dấu hiệu lộ dữ liệu cross-clinic.
