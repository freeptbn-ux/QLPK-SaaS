# Phase 02: UI Component + Tích hợp vào trang bệnh nhân
**Status:** ✅ Done
**Dependencies:** Phase 01

## Objective
Tạo Dialog hiển thị bảng "Lịch sử dùng thuốc" và gắn nút mở Dialog vào trang chi tiết bệnh nhân.

## Giải thích đơn giản
Giống hệt cửa sổ "Lịch Sử Dùng Thuốc" trong app cũ:
- Một bảng 2 cột: Tên Thuốc | Số Lần Kê
- Thuốc dùng ≥ 3 lần → in đậm (để bác sĩ biết thuốc này bệnh nhân hay dùng)
- Sắp xếp sẵn: thuốc dùng nhiều nhất ở trên cùng
- Có nút "Đóng" để tắt bảng

## Requirements
### Functional
- [x] Tạo component `MedicineUsageDialog` hiển thị dạng Dialog (popup)
- [x] Bảng có 2 cột: "Tên thuốc" và "Số lần kê"
- [x] Hiển thị thêm quy cách đóng gói (packing_spec) dưới tên thuốc (chữ nhỏ, màu xám)
- [x] Thuốc kê ≥ 3 lần → in đậm cả dòng
- [x] Mặc định sắp xếp theo số lần kê giảm dần
- [x] Nếu chưa có dữ liệu → hiện thông báo "Chưa có lịch sử dùng thuốc"
- [x] Thêm nút "Lịch sử dùng thuốc" vào phần header của `PrescriptionHistory`

### Non-Functional
- [x] Sử dụng MUI Dialog, Table components (giống phong cách hiện tại)
- [x] Dialog có animation mở/đóng mượt mà
- [x] Responsive - hiển thị tốt trên cả mobile và desktop

## Implementation Steps

### Bước 1: Tạo component MedicineUsageDialog
1. [x] Tạo file `src/components/features/patients/MedicineUsageDialog.tsx`
2. [x] Cấu trúc component:
   ```
   - Props: open, onClose, patientId, patientName
   - State: data (danh sách thuốc), loading
   - useEffect: khi open=true → gọi getMedicineUsageByPatient(patientId)
   - Render: Dialog → Table (Tên thuốc | Số lần kê)
   ```

3. [ ] Chi tiết UI:
   ```
   ┌──────────────────────────────────────────┐
   │  Lịch sử dùng thuốc: Nguyễn Văn A       │
   ├──────────────────────────────────────────┤
   │  TÊN THUỐC              │  SỐ LẦN KÊ   │
   │─────────────────────────│───────────────│
   │  **Zaroma**              │  **3**        │  ← In đậm (≥3 lần)
   │  **Augbidil 500Mg**      │  **3**        │  ← In đậm (≥3 lần)
   │  Zt-Amox                 │  2            │
   │  Dexanic (Dexa 0,5Mg)    │  2            │
   │  Atersin                 │  1            │
   ├──────────────────────────────────────────┤
   │                              [  Đóng  ]  │
   └──────────────────────────────────────────┘
   ```

### Bước 2: Tích hợp vào PrescriptionHistory
4. [x] Mở file `src/components/features/patients/PrescriptionHistory.tsx`
5. [x] Import `MedicineUsageDialog`
6. [x] Thêm state: `historyDialogOpen` (boolean)
7. [x] Thêm nút "Lịch sử dùng thuốc" (icon: History) cạnh nút "Kê đơn mới"
8. [x] Render `MedicineUsageDialog` với các props phù hợp

### Bước 3: Kiểm tra
9. [x] `npm run build` thành công
10. [x] Kiểm tra giao diện trên trình duyệt

## Files to Create/Modify
- `src/components/features/patients/MedicineUsageDialog.tsx` - **Tạo mới** - Dialog hiển thị lịch sử dùng thuốc
- `src/components/features/patients/PrescriptionHistory.tsx` - **Sửa** - Thêm nút và gọi Dialog

## Gợi ý code MedicineUsageDialog

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Box,
  CircularProgress,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { getMedicineUsageByPatient } from '@/actions/patients';

interface MedicineUsageDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
}

export default function MedicineUsageDialog({ open, onClose, patientId, patientName }: MedicineUsageDialogProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getMedicineUsageByPatient(patientId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [open, patientId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Lịch sử dùng thuốc: {patientName}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Chưa có lịch sử dùng thuốc
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Tên thuốc</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>Số lần kê</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => {
                  const isBold = row.times_prescribed >= 3;
                  return (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                        {row.medicine_name}
                        {row.packing_spec && (
                          <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                            {row.packing_spec}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                        {row.times_prescribed}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Gợi ý sửa PrescriptionHistory

Thêm vào phần header (cạnh nút "Kê đơn mới"):
```tsx
// Thêm state
const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

// Thêm nút cạnh "Kê đơn mới"
<Button
  variant="outlined"
  startIcon={<HistoryIcon />}
  onClick={() => setHistoryDialogOpen(true)}
>
  Lịch sử dùng thuốc
</Button>

// Thêm Dialog vào cuối component
<MedicineUsageDialog
  open={historyDialogOpen}
  onClose={() => setHistoryDialogOpen(false)}
  patientId={patientId}
  patientName={/* cần truyền thêm patientName */}
/>
```

⚠️ **Lưu ý:** Có thể cần truyền thêm prop `patientName` từ `PatientDetail` xuống `PrescriptionHistory` để hiển thị trong tiêu đề Dialog.

## Test Criteria
- [x] Bấm nút "Lịch sử dùng thuốc" → Dialog mở ra với bảng dữ liệu đúng
- [x] Thuốc kê ≥ 3 lần → hiển thị in đậm
- [x] Bệnh nhân chưa có đơn → hiện "Chưa có lịch sử dùng thuốc"
- [x] Bấm "Đóng" → Dialog đóng lại
- [x] Hiển thị tốt trên mobile (responsive)
- [x] `npm run build` thành công

---
✅ Hoàn thành cả 2 phases = Tính năng "Lịch sử dùng thuốc" đã sẵn sàng!
