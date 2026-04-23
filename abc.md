# 🔍 Báo cáo Debug: Lỗi Text "Nhảy Dòng" / Đè Lên Viền

Chào anh, em là Long đây. Em đã kiểm tra form "Thêm bệnh nhân mới" và tình trạng các chữ (label/hint text) bị nhảy lung tung, đè lên viền của ô nhập liệu như trong ảnh anh cung cấp.

## 🎯 Nguyên nhân gốc rễ (Root Cause)

Lỗi này là một "đặc sản" khá phổ biến khi kết hợp **Material-UI (MUI)** với **Next.js App Router** (React 18/19), cụ thể là do các nguyên nhân sau:

### 1. Xung đột thứ tự ưu tiên CSS (CSS Specificity & CSS Layers)
Trong file `src/components/ThemeRegistry.tsx`, anh đang bật tính năng CSS Layer của MUI (`enableCssLayer: true`):
```tsx
<AppRouterCacheProvider options={{ enableCssLayer: true }}>
```
Tuy nhiên, trong file `src/app/globals.css` của anh, lại **chưa khai báo** `@layer mui;` ở đầu file. 
👉 **Hậu quả:** Trong CSS hiện đại, các style bình thường (không nằm trong layer nào) sẽ tự động có độ ưu tiên cao hơn các style được đặt trong layer. Vì thế, CSS của MUI bị đè mất. Khi ô input (`TextField`) cố gắng tạo một khoảng trống (gọi là "notch") trên đường viền để chữ nổi lên, CSS động của MUI tính toán độ rộng khoảng trống này bị thất bại, khiến đường viền chạy xuyên qua chữ.

### 2. Hiện tượng "Ép nhảy" do Placeholder
Nếu anh để ý kỹ, ô "Ngày sinh / Tuổi" chữ bị nhảy lên trên cùng dù chưa nhập gì, trong khi các ô khác chữ nằm ở giữa. 
👉 **Lý do:** Ở ô "Ngày sinh", code có dòng `placeholder="Ví dụ: 1990 hoặc 12 tháng"`. Trong nguyên tắc của MUI, nếu ô có `placeholder`, chữ Label **bắt buộc phải nhảy lên trên (shrink)** ngay lập tức để không bị đè lên placeholder. Điều này tạo cảm giác các label nhảy lung tung, không đồng bộ với nhau.

### 3. Vấn đề với Form Control (React Hook Form)
Trong `PatientFormDialog.tsx`, anh đang dùng `useForm` với `Controller`. Khi form vừa mở lên, dữ liệu khởi tạo là chuỗi rỗng `''`. Việc giá trị thay đổi trong lúc Component được mount trên cửa sổ Dialog (popup) khiến hiệu ứng animation nổi chữ của MUI bị khựng hoặc tính toán sai kích thước.

---

## 💡 Cách khắc phục triệt để

Anh có thể tự sửa hoặc bảo em sửa giúp qua 2 bước đơn giản:

**Cách 1: Fix lỗi mất khoảng trống đường viền (Viền đè chữ)**
Mở file `src/app/globals.css`, thêm dòng này lên trên cùng (dòng số 1):
```css
@layer mui;
```

**Cách 2: Fix lỗi chữ nhảy không đồng đều**
- Hoặc anh bỏ `placeholder` ở ô "Ngày sinh" đi.
- Hoặc anh ép tất cả các ô đều luôn có chữ nổi lên trên bằng cách thêm prop này vào mọi `<TextField>`:
```tsx
InputLabelProps={{ shrink: true }}
```

Anh check file này xem đã rõ lý do chưa nhé. Muốn em sửa code luôn thì cứ gõ lệnh bảo em!
