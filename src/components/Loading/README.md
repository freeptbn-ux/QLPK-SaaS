# Loading Component

Hệ thống loading đồng nhất cho toàn bộ ứng dụng QLPK-SaaS.

## Features
- **4 Biến thể**: Spinner, Skeleton (Pulse), Shimmer, và Progress Bar.
- **UX-Optimized**: Tự động delay (200ms) để tránh nháy màn hình khi mạng nhanh.
- **Visual Stability**: Đảm bảo hiển thị tối thiểu (300ms) để không gây cảm giác giật cục.
- **Accessibility**: Hỗ trợ ARIA attributes (`role="status"`, `aria-live`).
- **Performance**: Có logging cảnh báo nếu loading quá lâu (> 2s).

## Usage

### 1. Spinner (Mặc định)
Dùng cho loading dữ liệu toàn trang hoặc các block nội dung.

```tsx
import Loading from '@/components/Loading';

function MyComponent({ isLoading, data }) {
  return (
    <Loading isLoading={isLoading} variant="spinner" size="lg">
      <div>{data.content}</div>
    </Loading>
  );
}
```

### 2. Skeleton
Dùng cho trải nghiệm hiện đại, mô phỏng cấu trúc UI.

```tsx
import Loading from '@/components/Loading';

function PatientCard({ isLoading, patient }) {
  return (
    <Loading 
      isLoading={isLoading} 
      variant="skeleton" 
      className="h-24 w-full rounded-xl"
    >
      <div className="p-4 border rounded-xl">
        <h3>{patient.name}</h3>
        <p>{patient.phone}</p>
      </div>
    </Loading>
  );
}
```

### 3. Progressive Bar
Dùng cho các thanh trạng thái hoặc top-loading.

```tsx
<Loading isLoading={isLoading} variant="bar" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | **Required** | Trạng thái loading từ API/Data |
| `variant` | `'spinner' \| 'skeleton' \| 'shimmer' \| 'bar'` | `'spinner'` | Loại UI hiển thị |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Kích thước (áp dụng cho spinner/bar) |
| `delay` | `number` | `200` | Thời gian chờ trước khi hiện (ms) |
| `minDuration` | `number` | `300` | Thời gian hiển thị tối thiểu (ms) |
| `className` | `string` | `''` | CSS bổ sung cho container |
| `children` | `ReactNode` | `undefined` | Nội dung sẽ ẩn khi loading |

## Logic Hook
Bạn có thể dùng `useLoadingState` độc lập nếu muốn tự render UI custom:

```tsx
import { useLoadingState } from '@/components/Loading/useLoadingState';

const shouldShow = useLoadingState(isLoading, { delay: 500 });
```
