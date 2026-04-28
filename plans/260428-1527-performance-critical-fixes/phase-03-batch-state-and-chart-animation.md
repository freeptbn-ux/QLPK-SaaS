# Phase 03: Gộp State Updates + Tối ưu Chart Animation
Status: ✅ Completed
Dependencies: Không (có thể làm song song)

## Vấn đề hiện tại

### Vấn đề A: 4 lần setState riêng lẻ trong StatisticsClient (dòng 109-112)
```typescript
// Hiện tại — 4 re-render liên tiếp:
setVisitData(visits);       // re-render #1
setRevenueData(revenue);    // re-render #2
setDobData(dobs...);        // re-render #3
setMedicineData(medicines); // re-render #4
```
Mỗi lần setState → React re-render → Recharts tính toán lại layout → animation chạy lại.

### Vấn đề B: Recharts animation 1500ms chạy lại mỗi khi data thay đổi
- `VisitChart.tsx` dòng 66: `animationDuration={1500}`
- `RevenueChart.tsx` dòng 83: `animationDuration={1500}`
- Kết hợp vấn đề A: 4 re-render × 1500ms animation = ~6 giây UI bị lock

## Implementation Steps

### 1. Gộp 4 state thành 1 state object trong `StatisticsClient.tsx`

- [x] Thay 4 state riêng lẻ (`visitData`, `revenueData`, `dobData`, `medicineData`) bằng 1 state object `chartData`
- [x] Trong `fetchData`, gọi `setChartData` **một lần duy nhất** sau khi có đủ data

```typescript
// TRƯỚC (4 state riêng lẻ):
const [visitData, setVisitData] = useState<...>([]);
const [revenueData, setRevenueData] = useState<...>([]);
const [dobData, setDobData] = useState<string[]>([]);
const [medicineData, setMedicineData] = useState<...>([]);

// SAU (1 state object):
const [chartData, setChartData] = useState<{
  visitData: { name: string; count: number }[];
  revenueData: { name: string; revenue: number }[];
  dobData: string[];
  medicineData: { name: string; totalQuantity: number; totalRevenue: number }[];
}>({
  visitData: [],
  revenueData: [],
  dobData: [],
  medicineData: [],
});
```

```typescript
// TRƯỚC (4 lần setState):
setVisitData(visits);
setRevenueData(revenue);
setDobData(dobs.filter(...));
setMedicineData(medicines);

// SAU (1 lần setState):
setChartData({
  visitData: visits,
  revenueData: revenue,
  dobData: dobs.filter((d: string | null): d is string => d !== null),
  medicineData: medicines,
});
```

- [x] Cập nhật JSX để đọc từ `chartData.visitData`, `chartData.revenueData`, v.v.

### 2. Giảm animation duration trong `VisitChart.tsx`
- [x] Đổi dòng 66: `animationDuration={1500}` → `animationDuration={800}`
- [x] Đổi key của Cell từ index sang giá trị ổn định: `key={entry.name}` thay vì `key={\`cell-${index}\`}`

```typescript
// TRƯỚC:
<Bar dataKey="count" radius={[6, 6, 6, 6]} animationDuration={1500} barSize={...}>
  {data.map((entry, index) => (
    <Cell key={`cell-${index}`} fill="#3b82f6" />
  ))}
</Bar>

// SAU:
<Bar dataKey="count" radius={[6, 6, 6, 6]} animationDuration={800} barSize={...}>
  {data.map((entry) => (
    <Cell key={entry.name} fill="#3b82f6" />
  ))}
</Bar>
```

### 3. Giảm animation duration trong `RevenueChart.tsx`
- [x] Đổi dòng 83: `animationDuration={1500}` → `animationDuration={800}`

```typescript
// TRƯỚC:
<Area ... animationDuration={1500} />

// SAU:
<Area ... animationDuration={800} />
```

### 4. Kiểm tra
- [x] Chạy `npm run dev`
- [x] Vào trang Thống kê → đổi time range (ngày/tuần/tháng/năm)
- [x] Biểu đồ vẫn hiển thị đúng data
- [x] Animation mượt hơn, không bị giật/lặp
- [x] Không có lỗi TypeScript

## Files thay đổi
- `src/components/features/statistics/StatisticsClient.tsx` — **SỬA** (gộp state)
- `src/components/features/statistics/VisitChart.tsx` — **SỬA** (animation + key)
- `src/components/features/statistics/RevenueChart.tsx` — **SỬA** (animation)

## Kết quả mong đợi
- Giảm **75%** số lần re-render (4 → 1) khi đổi time range
- Animation nhanh gọn hơn (800ms thay vì 1500ms)
- UI responsive ngay lập tức thay vì bị lock 6 giây

---
✅ Hoàn thành plan. Sau khi fix xong 3 phases → chạy `/test` để verify.
