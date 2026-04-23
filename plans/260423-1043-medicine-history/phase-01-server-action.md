# Phase 01: Server Action - Lấy dữ liệu tổng hợp thuốc
**Status:** ✅ Done
**Dependencies:** Không có

## Objective
Tạo Server Action để truy vấn tổng hợp tất cả các loại thuốc mà một bệnh nhân đã từng được kê, kèm số lần kê mỗi loại.

## Giải thích đơn giản
Hiện tại dữ liệu thuốc đã nằm sẵn trong database với cấu trúc rõ ràng:
- Bảng `prescriptions_header` → chứa thông tin đơn thuốc (thuộc bệnh nhân nào)
- Bảng `prescription_details` → chứa chi tiết từng loại thuốc trong đơn (medicine_id, quantity)
- Bảng `medicines` → chứa tên thuốc

Ta chỉ cần viết 1 câu SQL nối 3 bảng này lại, nhóm theo tên thuốc và đếm số lần xuất hiện.

## Requirements
### Functional
- [x] Tạo hàm `getMedicineUsageByPatient(patientId: number)` trong `src/actions/patients.ts`
- [x] Hàm trả về danh sách: `{ medicine_name: string, packing_spec: string, times_prescribed: number }`
- [x] Sắp xếp theo số lần kê giảm dần (thuốc dùng nhiều nhất lên trên)
- [x] Nếu bệnh nhân chưa có đơn thuốc nào → trả về mảng rỗng `[]`

### Non-Functional
- [x] Dùng Supabase query (không cần tạo RPC mới)
- [x] Xử lý lỗi đúng cách (try/catch, console.error)

## Implementation Steps
1. [x] Mở file `src/actions/patients.ts`
2. [x] Thêm hàm `getMedicineUsageByPatient` với logic:
   ```typescript
   // Bước 1: Lấy tất cả prescription_header_id của bệnh nhân
   // Bước 2: Lấy tất cả prescription_details thuộc các header đó
   // Bước 3: Nhóm theo medicine_id, đếm số lần xuất hiện (COUNT)
   // Bước 4: Join với bảng medicines để lấy tên thuốc
   // Bước 5: Sắp xếp giảm dần theo số lần kê
   ```
3. [x] Cách đơn giản nhất: Dùng Supabase RPC hoặc query thủ công từ client

### Gợi ý cách query
Vì Supabase JS client không hỗ trợ GROUP BY trực tiếp, ta có 2 cách:

**Cách 1 (Đề xuất - Đơn giản):** Lấy tất cả prescription_details rồi xử lý nhóm bằng JavaScript
```typescript
export async function getMedicineUsageByPatient(patientId: number) {
  const supabase = await createClient();

  // Lấy tất cả chi tiết đơn thuốc của bệnh nhân này
  const { data, error } = await supabase
    .from('prescription_details')
    .select(`
      medicine_id,
      medicines(name, packing_spec),
      prescriptions_header!inner(patient_id)
    `)
    .eq('prescriptions_header.patient_id', patientId);

  if (error) {
    console.error('Error fetching medicine usage:', error);
    return [];
  }

  // Nhóm theo medicine_id và đếm số lần kê
  const usageMap = new Map();
  for (const item of data || []) {
    const id = item.medicine_id;
    if (usageMap.has(id)) {
      usageMap.get(id).times_prescribed += 1;
    } else {
      usageMap.set(id, {
        medicine_name: item.medicines?.name || 'Không rõ',
        packing_spec: item.medicines?.packing_spec || '',
        times_prescribed: 1,
      });
    }
  }

  // Chuyển Map thành Array và sắp xếp giảm dần
  return Array.from(usageMap.values())
    .sort((a, b) => b.times_prescribed - a.times_prescribed);
}
```

## Files to Create/Modify
- `src/actions/patients.ts` - **Sửa** - Thêm hàm `getMedicineUsageByPatient`

## Test Criteria
- [x] Gọi hàm với patientId có đơn thuốc → trả về danh sách thuốc đúng, sắp xếp giảm dần
- [x] Gọi hàm với patientId không có đơn thuốc → trả về `[]`
- [x] `npm run build` thành công

---
Next Phase: phase-02-ui-integration.md
