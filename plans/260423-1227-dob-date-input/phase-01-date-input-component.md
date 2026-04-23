# Phase 01: Tạo Component DateInput (DD/MM/YYYY Auto-Jump)

Status: ✅ Completed
Dependencies: Không

## Objective

Tạo component `DateInput` có khả năng:
- Hiển thị 3 ô input liền nhau: `DD` / `MM` / `YYYY`
- Chỉ chấp nhận ký tự số (0-9)
- Tự động nhảy focus sang ô tiếp theo khi nhập đủ ký tự
- Tự động nhảy ngược (Backspace khi ô rỗng → quay lại ô trước)
- Trả về giá trị dạng string `DD/MM/YYYY` cho form cha

## Requirements

### Functional
- [x] Chỉ cho phép nhập số (chặn chữ cái, ký tự đặc biệt)
- [x] Ô DD: max 2 ký tự → auto-focus sang MM
- [x] Ô MM: max 2 ký tự → auto-focus sang YYYY
- [x] Ô YYYY: max 4 ký tự
- [x] Backspace khi ô rỗng → focus ngược lại ô trước
- [x] Paste chuỗi `DD/MM/YYYY` hoặc `DDMMYYYY` → tự phân tách vào đúng ô
- [x] Component nhận `value` (string `DD/MM/YYYY`) và `onChange` callback
- [x] Hỗ trợ `label`, `error`, `helperText` props (tương thích MUI)

### Non-Functional
- [x] Responsive: hiển thị đẹp trên cả mobile và desktop
- [x] Accessible: hỗ trợ keyboard navigation (Tab, Shift+Tab)
- [x] Không phụ thuộc thư viện ngoài (chỉ dùng React + MUI)

## Implementation Steps

### 1. Tạo file component

- [x] Tạo `src/components/ui/DateInput.tsx`

### 2. Thiết kế giao diện

```
┌─────────────────────────────────────────────┐
│  Ngày sinh *                                │
│  ┌────┐   ┌────┐   ┌────────┐              │
│  │ DD │ / │ MM │ / │  YYYY  │              │
│  └────┘   └────┘   └────────┘              │
│  Vui lòng nhập ngày sinh hợp lệ           │
└─────────────────────────────────────────────┘
```

- 3 ô `<input>` nằm trong 1 container styled giống MUI OutlinedInput
- Dấu `/` là text tĩnh giữa các ô
- Label nổi lên trên (giống MUI TextField outlined)
- Border chuyển màu khi focus (giống MUI)
- Border đỏ khi error

### 3. Logic auto-jump

```typescript
// Pseudo-code
const handleDayChange = (value: string) => {
  // Chỉ giữ số
  const digits = value.replace(/\D/g, '').slice(0, 2);
  setDay(digits);
  
  // Auto-jump khi nhập đủ 2 số
  if (digits.length === 2) {
    monthRef.current?.focus();
  }
};

const handleMonthChange = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 2);
  setMonth(digits);
  
  if (digits.length === 2) {
    yearRef.current?.focus();
  }
};

const handleYearChange = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  setYear(digits);
};
```

### 4. Logic Backspace ngược

```typescript
const handleKeyDown = (field: 'day' | 'month' | 'year', e: KeyboardEvent) => {
  if (e.key === 'Backspace' && e.currentTarget.value === '') {
    if (field === 'month') dayRef.current?.focus();
    if (field === 'year') monthRef.current?.focus();
  }
};
```

### 5. Logic Paste thông minh

```typescript
const handlePaste = (e: ClipboardEvent) => {
  const pasted = e.clipboardData.getData('text');
  const digits = pasted.replace(/\D/g, '');
  
  if (digits.length >= 8) {
    // DDMMYYYY
    setDay(digits.slice(0, 2));
    setMonth(digits.slice(2, 4));
    setYear(digits.slice(4, 8));
    yearRef.current?.focus();
    e.preventDefault();
  } else if (pasted.includes('/')) {
    // DD/MM/YYYY
    const parts = pasted.split('/');
    if (parts.length === 3) {
      setDay(parts[0].slice(0, 2));
      setMonth(parts[1].slice(0, 2));
      setYear(parts[2].slice(0, 4));
      yearRef.current?.focus();
      e.preventDefault();
    }
  }
};
```

### 6. Sync value với form cha

```typescript
// Khi day/month/year thay đổi → gọi onChange
useEffect(() => {
  if (day && month && year) {
    const padded = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    onChange(padded);
  } else if (!day && !month && !year) {
    onChange('');  // Cho phép để trống
  }
}, [day, month, year]);

// Khi nhận value từ form → parse ngược
useEffect(() => {
  if (value && value.includes('/')) {
    const [d, m, y] = value.split('/');
    setDay(d || '');
    setMonth(m || '');
    setYear(y || '');
  }
}, [value]);
```

## Files to Create/Modify

| File | Action | Mô tả |
|------|--------|--------|
| `src/components/ui/DateInput.tsx` | **CREATE** | Component chính |

## Props Interface

```typescript
interface DateInputProps {
  value: string;                    // "DD/MM/YYYY" hoặc ""
  onChange: (value: string) => void;
  label?: string;                   // Default: "Ngày sinh"
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: {                   // Placeholder cho từng ô
    day?: string;    // Default: "DD"
    month?: string;  // Default: "MM"
    year?: string;   // Default: "YYYY"
  };
}
```

## Test Criteria

- [x] Nhập `05032025` → hiển thị `05 / 03 / 2025`, cursor ở ô YYYY
- [x] Nhập `0` ở DD → cursor vẫn ở DD, nhập tiếp `5` → nhảy sang MM
- [x] Backspace khi MM rỗng → cursor quay về DD
- [x] Paste `15/06/1990` → hiển thị đúng 3 ô
- [x] Paste `15061990` → hiển thị đúng 3 ô
- [x] Nhập chữ "abc" → không hiển thị gì
- [x] Tab → di chuyển giữa DD → MM → YYYY
- [x] Shift+Tab → di chuyển ngược YYYY → MM → DD
- [x] Component hiển thị border đỏ khi `error={true}`

## Notes

- Dùng `useRef` cho 3 ô input để control focus
- Không dùng `type="number"` (để tránh spinner arrows trên browser)
- Dùng `inputMode="numeric"` để bàn phím số hiện trên mobile
- Style phải match với MUI TextField outlined variant hiện tại trong form

---
Next Phase: → phase-02-integration.md (Tích hợp vào form + Validation)
