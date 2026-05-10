# Phase 03: Tích hợp vào Prescription Form

Status: ✅ Completed
Dependencies: Phase 01 (API Route) + Phase 02 (Speech Bubble)

## Objective

Biến tên thuốc trong bảng kê đơn thành **link có thể click**, kết nối với SpeechBubble component và API Route để hiển thị liều dùng.

## Requirements

### Functional
- [x] Tên thuốc trong cột "TÊN THUỐC" hiện dạng link (màu xanh, có underline khi hover)
- [x] Click tên thuốc → mở SpeechBubble → gọi API tra cứu liều dùng
- [x] Click thuốc khác khi đang mở bubble → đóng bubble cũ, mở bubble mới
- [x] Cache kết quả: cùng 1 thuốc click lần 2 → hiện kết quả ngay, không gọi API lại
- [x] Chỉ 1 bubble mở cùng lúc

### Non-Functional
- [x] Không ảnh hưởng form kê đơn (không block submit, input...)
- [x] Không ảnh hưởng performance render bảng thuốc
- [x] Tên thuốc vẫn hiển thị rõ ràng (link style không quá khác biệt)

## Implementation Steps

### 1. Sửa PrescriptionItemRow - Tên thuốc thành link
- [x] Sửa file `PrescriptionItemRow.tsx`
- [x] Thêm prop `onMedicineClick: (medicineName: string, anchorEl: HTMLElement) => void`
- [x] Tên thuốc wrap trong `<button>` hoặc `<a>` có style link
- [x] Thêm `ref` để truyền anchor position cho SpeechBubble
- [x] Thêm icon nhỏ 💊 hoặc 🔍 bên cạnh tên thuốc để gợi ý "click để tra cứu"

**Trước:**
```jsx
<div className="font-medium text-gray-900">
  {item.medicine_name}
</div>
```

**Sau:**
```jsx
<button
  ref={anchorRef}
  onClick={() => onMedicineClick(item.medicine_name, anchorRef.current)}
  className="font-medium text-primary-600 hover:text-primary-700 hover:underline 
             cursor-pointer transition-colors inline-flex items-center gap-1"
  title="Click để tra cứu liều dùng"
>
  {item.medicine_name}
  <HiOutlineInformationCircle className="w-3.5 h-3.5 opacity-50" />
</button>
```

### 2. Sửa PrescriptionForm - Quản lý state bubble
- [x] Thêm state: `activeDosageLookup: { medicineName: string, anchorEl: HTMLElement } | null`
- [x] Thêm state: `dosageCache: Map<string, string>` (cache kết quả theo tên thuốc)
- [x] Tạo `handleMedicineClick` function
- [x] Render SpeechBubble component ở cuối form

**State mới:**
```tsx
const [activeDosageLookup, setActiveDosageLookup] = useState<{
  medicineName: string;
  anchorEl: HTMLElement;
} | null>(null);

const dosageCacheRef = useRef<Map<string, string>>(new Map());
```

### 3. Tạo Hook useMedicineDosage
- [x] Tạo file `src/hooks/useMedicineDosage.ts`
- [x] Quản lý: fetch state (loading, data, error), cache
- [x] Auto-fetch khi medicineName thay đổi
- [x] Retry logic (1 lần retry nếu fail)

**API call flow:**
```
1. Check cache → Có? → Return cached data
2. Không có → Set loading = true
3. fetch('/api/medicine-dosage', { method: 'POST', body: { medicineName } })
4. Parse response
5. Lưu vào cache
6. Return data
```

### 4. Kết nối tất cả lại
- [x] PrescriptionForm render SpeechBubble khi `activeDosageLookup !== null`
- [x] Truyền `anchorRef` từ clicked row
- [x] SpeechBubble hiển thị loading → kết quả / lỗi
- [x] Close handler reset `activeDosageLookup` về null

### 5. Mobile UX Considerations
- [x] Trên mobile, click tên thuốc → bottom sheet slide up
- [x] Tên thuốc trên mobile vẫn hiện link style nhưng icon nhỏ hơn
- [x] Bottom sheet có nút "Đóng" to rõ ràng (dễ bấm ngón tay)

## Files to Create/Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/components/features/prescriptions/PrescriptionItemRow.tsx` | **Sửa** | Tên thuốc → link clickable |
| `src/components/features/prescriptions/PrescriptionForm.tsx` | **Sửa** | Thêm state management & render SpeechBubble |
| `src/hooks/useMedicineDosage.ts` | **Tạo mới** | Hook gọi API + cache |

## Test Criteria

- [ ] Click tên thuốc → bubble hiện với loading state
- [ ] Loading xong → hiển thị liều dùng formatted
- [ ] Click thuốc khác → bubble cũ đóng, mở bubble mới
- [ ] Click cùng thuốc lần 2 → hiện ngay từ cache (không loading)
- [ ] Đóng bubble → click lại → vẫn từ cache
- [ ] Form kê đơn vẫn hoạt động bình thường (submit, thêm thuốc, xóa thuốc...)
- [ ] Mobile: bottom sheet hiện đúng, nút đóng hoạt động
- [ ] Xóa thuốc khỏi đơn khi bubble đang mở → bubble tự đóng

## Notes

- `PrescriptionItemRow` đang dùng `React.memo` → cần đảm bảo `onMedicineClick` được wrap `useCallback` 
- Cache dùng `useRef` (Map) thay vì `useState` để không trigger re-render khi cache update
- Anchor element reference cần stable → dùng ref trong row component
- Khi xóa thuốc (remove item), check nếu đang hiện bubble cho thuốc đó → tự đóng

---
Previous Phase: ← [Phase 02: Speech Bubble Component](./phase-02-speech-bubble.md)
Next Phase: → [Phase 04: Testing & Polish](./phase-04-testing.md)
