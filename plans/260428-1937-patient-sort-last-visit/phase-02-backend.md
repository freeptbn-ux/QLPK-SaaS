# Phase 02: Backend Update
Status: ✅ Completed
Dependencies: Phase 01 (Database Function phải tạo xong)

## Objective
Cập nhật server actions và TypeScript types để gọi RPC function mới `get_patients_with_last_visit` thay vì query trực tiếp bảng `patients`.

## Implementation Steps

### 1. Cập nhật TypeScript type `Patient`

**File:** `src/types/database.ts`

Thêm field `last_visit_date` vào interface `Patient`:

```diff
 export interface Patient {
   id: number;
   name: string;
   dob: string | null;
   gender: string | null;
   address: string | null;
   phone: string | null;
   weight: string | null;
   medical_history: string | null;
   diagnosis: string | null;
   created_at: string;
   updated_at?: string;
   name_normalized: string | null;
+  last_visit_date?: string | null;
 }
```

**Lý do dùng optional (`?`):** Chỉ có khi gọi từ RPC mới, không ảnh hưởng các nơi khác dùng `Patient` type.

### 2. Cập nhật `getPatientsPaginated` function

**File:** `src/actions/patients.ts` (line 14-32)

Thay thế query trực tiếp bảng `patients` bằng gọi RPC:

```typescript
export async function getPatientsPaginated(page: number, pageSize: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const offset = (page - 1) * pageSize;

  const { data, error } = await supabase.rpc('get_patients_with_last_visit', {
    p_search_term: null,
    p_search_normalized: null,
    p_limit: pageSize,
    p_offset: offset,
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  const count = data && data.length > 0 ? Number(data[0].total_count) : 0;
  
  // Map RPC result to Patient type (loại bỏ total_count khỏi mỗi row)
  const patients: Patient[] = (data || []).map(({ total_count, ...patient }) => ({
    ...patient,
    last_visit_date: patient.last_visit_date || null,
  }));

  return { data: patients, count };
}
```

### 3. Cập nhật `searchPatients` function

**File:** `src/actions/patients.ts` (line 34-63)

Tương tự, thay thế bằng RPC call:

```typescript
export async function searchPatients(term: string, page: number, pageSize: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const offset = (page - 1) * pageSize;
  const normalizedTerm = removeDiacritics(term);

  const { data, error } = await supabase.rpc('get_patients_with_last_visit', {
    p_search_term: term || null,
    p_search_normalized: normalizedTerm || null,
    p_limit: pageSize,
    p_offset: offset,
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  const count = data && data.length > 0 ? Number(data[0].total_count) : 0;
  
  const patients: Patient[] = (data || []).map(({ total_count, ...patient }) => ({
    ...patient,
    last_visit_date: patient.last_visit_date || null,
  }));

  return { data: patients, count };
}
```

### 4. Xóa import không cần thiết

Sau khi refactor, kiểm tra xem `escapeLikePattern` có còn được dùng ở đâu khác trong file không. Nếu không → xóa import.

## Files to Create/Modify

| File | Thay đổi |
|------|----------|
| `src/types/database.ts` (line 1-14) | Thêm `last_visit_date?: string \| null` vào `Patient` interface |
| `src/actions/patients.ts` (line 14-63) | Refactor `getPatientsPaginated` + `searchPatients` để gọi RPC |

## Test Criteria
- [ ] `getPatientsPaginated(1, 50)` trả về bệnh nhân sắp xếp theo ngày khám gần nhất
- [ ] `searchPatients('nguyen', 1, 50)` trả về kết quả tìm kiếm đúng, vẫn sắp xếp theo ngày khám
- [ ] `count` trả về đúng tổng số bệnh nhân
- [ ] Mỗi patient có field `last_visit_date` (hoặc `null` nếu chưa khám)
- [ ] Trang `/patients` load bình thường, không lỗi TypeScript
- [ ] Pagination hoạt động đúng (chuyển trang, thay đổi số hàng)
- [ ] Các nơi khác dùng `Patient` type không bị ảnh hưởng (vì `last_visit_date` là optional)

## Rủi ro & Lưu ý
- ⚠️ Import `escapeLikePattern` có thể trở thành unused → cần check
- ⚠️ RPC trả về `total_count` trong mỗi row → cần strip ra trước khi trả về client
- ⚠️ `last_visit_date` từ RPC là ISO string (timestamptz) → frontend cần format hiển thị

---
Previous Phase: ← [Phase 01: Database Function](./phase-01-database.md)
Next Phase: → [Phase 03: Frontend Update](./phase-03-frontend.md)
