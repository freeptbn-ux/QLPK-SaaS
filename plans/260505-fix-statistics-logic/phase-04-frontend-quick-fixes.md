# Phase 04: Frontend Quick Fixes — Static Data + Estimated Count

Status: ✅ DONE
Dependencies: Không (có thể chạy song song)
Fixes: Bug #5 (🟡), Bug #8 (🟡)

## Objective

1. **Bug #8:** Đổi `estimated` → `exact` count cho totalPatients (1 dòng code)
2. **Bug #5:** Quyết định xử lý Gender & Location data tĩnh

## Implementation Steps

### Step 1: Fix Bug #8 — Đổi estimated → exact

File: `src/actions/statistics.ts` (dòng 157)

```typescript
// TRƯỚC:
supabase.from('patients').select('*', { count: 'estimated', head: true }),

// SAU:
supabase.from('patients').select('*', { count: 'exact', head: true }),
```

**Giải thích:**
- `estimated` dùng `pg_class.reltuples` (ước lượng từ stats collector) → nhanh nhưng có thể sai
- `exact` dùng `COUNT(*)` thực → chính xác tuyệt đối
- Với phòng khám nhỏ (vài trăm → vài nghìn bệnh nhân), `exact` vẫn rất nhanh
- Không ảnh hưởng performance đáng kể

### Step 2: Fix Bug #5 — Quyết định xử lý Gender & Location tĩnh

**Phân tích:** Gender & Location hiện tại lấy dữ liệu TOÀN BỘ (không lọc theo tháng).

**Có 2 hướng xử lý:**

#### Hướng A: Giữ nguyên (recommended) — Thêm label "Tổng quan"
- Gender & Location phản ánh **phân bố tổng** của phòng khám, không cần lọc theo tháng
- Chỉ cần thêm subtitle để tránh nhầm lẫn

**Sửa trong `StatisticsClient.tsx`:** Không cần sửa logic, chỉ truyền thêm prop subtitle cho GenderPieChart & TopLocations nếu cần.

Thực tế, `TopLocations.tsx` đã có subtitle: *"Top 20 khu vực có nhiều lượt khám nhất"* → OK rồi.

`GenderPieChart.tsx` cần thêm subtitle: *"Phân bố tổng tất cả bệnh nhân"*.

File: `src/components/features/statistics/GenderPieChart.tsx` (dòng 23-25)

```tsx
// TRƯỚC:
<h3 className="text-base font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
  Phân bố giới tính
</h3>

// SAU:
<h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
  Phân bố giới tính
</h3>
<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 mb-5">
  Tổng quan tất cả bệnh nhân
</p>
```

#### Hướng B: Lọc theo thời gian (nếu anh muốn)
- Cần tạo thêm 2 RPC: `get_stats_by_gender_for_month`, `get_stats_by_location_for_month`
- Sửa frontend thêm setter cho genderData & locationData
- Effort lớn hơn, cần bàn thêm

**→ Khuyến nghị: Chọn Hướng A (giữ nguyên, thêm label). Nếu anh muốn Hướng B, nói em biết.**

## Files to Modify
- `src/actions/statistics.ts` (dòng 157) — đổi `estimated` → `exact`
- `src/components/features/statistics/GenderPieChart.tsx` (dòng 23-25) — thêm subtitle

## Test Criteria
- [ ] Card "Tổng bệnh nhân" hiển thị đúng số chính xác (240)
- [ ] GenderPieChart có subtitle "Tổng quan tất cả bệnh nhân"
- [ ] TopLocations subtitle giữ nguyên "Top 20 khu vực..."
- [ ] Không có regression — trang thống kê load bình thường

---
Next Phase: → phase-05-legacy-dob-floatingpoint.md
