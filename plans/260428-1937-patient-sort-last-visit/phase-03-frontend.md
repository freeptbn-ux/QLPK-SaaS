# Phase 03: Frontend Update
Status: ✅ Completed
Dependencies: Phase 02 (Backend phải trả về `last_visit_date`)

## Objective
Thêm cột "Khám gần nhất" vào bảng danh sách bệnh nhân trên cả Desktop table và Mobile cards, với format ngày tháng thân thiện.

## Implementation Steps

### 1. Tạo utility function format ngày khám

**File:** `src/lib/utils/date.ts` (tạo mới hoặc thêm vào file có sẵn)

```typescript
/**
 * Format ngày khám cuối cùng thành dạng thân thiện
 * - Nếu null → "Chưa khám"
 * - Nếu hôm nay → "Hôm nay"
 * - Nếu hôm qua → "Hôm qua"
 * - Nếu trong tuần → "X ngày trước"
 * - Nếu trong tháng → "X tuần trước"
 * - Nếu cũ hơn → "dd/MM/yyyy"
 */
export function formatLastVisit(date: string | null | undefined): string {
  if (!date) return 'Chưa khám';
  
  const visitDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - visitDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  
  return visitDate.toLocaleDateString('vi-VN');
}
```

### 2. Cập nhật Desktop Table

**File:** `src/components/features/patients/PatientListClient.tsx`

#### 2.1. Thêm header cột (sau cột "Địa chỉ", trước "Thao tác")

```diff
 <th className="px-6 py-5 font-bold tracking-tight">Địa chỉ</th>
+<th className="px-6 py-5 font-bold tracking-tight">Khám gần nhất</th>
 <th className="px-6 py-5 font-bold tracking-tight text-right">Thao tác</th>
```

#### 2.2. Thêm data cell cho mỗi row (sau cột Địa chỉ)

```diff
 <td className="px-6 py-5 truncate max-w-[200px]..." title={patient.address || ''}>
   {patient.address || 'N/A'}
 </td>
+<td className="px-6 py-5">
+  <div className={`text-sm font-medium ${
+    patient.last_visit_date 
+      ? 'text-slate-700 dark:text-slate-300' 
+      : 'text-slate-400 dark:text-slate-600 italic'
+  }`}>
+    {formatLastVisit(patient.last_visit_date)}
+  </div>
+  {patient.last_visit_date && (
+    <div className="text-xs text-slate-400 mt-0.5">
+      {new Date(patient.last_visit_date).toLocaleDateString('vi-VN')}
+    </div>
+  )}
+</td>
 <td className="px-6 py-5 text-right">
```

**Giải thích UI:**
- Dòng chính: Text thân thiện ("Hôm nay", "3 ngày trước", "Chưa khám")
- Dòng phụ (nhỏ hơn): Ngày cụ thể (dd/MM/yyyy) — chỉ hiện khi có ngày khám
- "Chưa khám" sẽ in nghiêng, màu nhạt hơn

#### 2.3. Cập nhật colspan cho empty state

```diff
-<td colSpan={7} className="px-6 py-20 text-center">
+<td colSpan={8} className="px-6 py-20 text-center">
```

### 3. Cập nhật Mobile Cards

**File:** `src/components/features/patients/PatientListClient.tsx` (phần Mobile Cards)

Thêm thông tin ngày khám vào card:

```diff
 <div className="flex justify-between items-start">
   <div>
     <h3 className="text-base font-bold...">{patient.name}</h3>
     <p className="text-sm text-slate-500 font-medium mt-0.5">
       {patient.gender} • {patient.dob ? formatAge(patient.dob) : 'N/A'}
     </p>
+    <p className="text-xs text-slate-400 mt-1">
+      🩺 {formatLastVisit(patient.last_visit_date)}
+    </p>
   </div>
```

### 4. Import statements

Thêm import `formatLastVisit` ở đầu file `PatientListClient.tsx`:

```diff
 import { formatAge } from '@/lib/utils/age';
+import { formatLastVisit } from '@/lib/utils/date';
```

## Files to Create/Modify

| File | Thay đổi |
|------|----------|
| `src/lib/utils/date.ts` | **Tạo mới** hoặc thêm function `formatLastVisit` |
| `src/components/features/patients/PatientListClient.tsx` | Thêm cột "Khám gần nhất" cho Desktop + Mobile |

## Test Criteria
- [ ] Desktop: Cột "Khám gần nhất" hiển thị đúng vị trí (giữa "Địa chỉ" và "Thao tác")
- [ ] Desktop: Bệnh nhân có lượt khám → hiển thị "X ngày trước" + ngày cụ thể
- [ ] Desktop: Bệnh nhân chưa khám → hiển thị "Chưa khám" (in nghiêng, màu nhạt)
- [ ] Desktop: Empty state (`colSpan`) đúng số cột mới (8)
- [ ] Mobile: Card hiển thị thông tin ngày khám dưới tên
- [ ] Responsive: Không bị vỡ layout trên các kích thước màn hình
- [ ] Dark mode: Màu sắc hiển thị đúng
- [ ] Danh sách đã sắp xếp đúng: bệnh nhân khám gần nhất → trên cùng
- [ ] Pagination vẫn hoạt động bình thường sau khi thêm cột

## Visual Preview (Expected)

### Desktop Table
```
| STT | Họ và tên      | Ngày sinh  | Giới tính | SĐT        | Địa chỉ    | Khám gần nhất   | Thao tác |
|-----|----------------|------------|-----------|------------|-------------|-----------------|----------|
| 1   | Nguyễn Văn A   | 15/03/1990 | Nam       | 0901234567 | Q.1, TPHCM  | Hôm nay         | 👁️ ✏️ 🗑️ |
|     |                | 36 tuổi    |           |            |             | 28/04/2026      |          |
| 2   | Trần Thị B     | 22/07/1985 | Nữ        | 0912345678 | Q.3, TPHCM  | 3 ngày trước    | 👁️ ✏️ 🗑️ |
|     |                | 40 tuổi    |           |            |             | 25/04/2026      |          |
| 3   | Lê Văn C       | 01/01/2000 | Nam       | 0923456789 | Q.7, TPHCM  | Chưa khám       | 👁️ ✏️ 🗑️ |
```

### Mobile Card
```
┌──────────────────────────────────────┐
│ Nguyễn Văn A                0901... │
│ Nam • 36 tuổi                       │
│ 🩺 Hôm nay                          │
│─────────────────────────────────────│
│       Chi tiết   Sửa   Xóa         │
└──────────────────────────────────────┘
```

---
Previous Phase: ← [Phase 02: Backend Update](./phase-02-backend.md)
