'use client';

import React from 'react';
import { Alert, AlertTitle, Button, Collapse } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface LowStockAlertProps {
  count: number;
  onFilterClick: () => void;
  isFiltered: boolean;
  onClearFilter: () => void;
}

export default function LowStockAlert({ count, onFilterClick, isFiltered, onClearFilter }: LowStockAlertProps) {
  if (count === 0 && !isFiltered) return null;

  return (
    <Collapse in={count > 0 || isFiltered}>
      <Alert
        severity="warning"
        icon={<WarningAmberIcon fontSize="inherit" />}
        sx={{ mb: 2, borderRadius: 2 }}
        action={
          isFiltered ? (
            <Button color="inherit" size="small" onClick={onClearFilter}>
              Hiện tất cả
            </Button>
          ) : (
            <Button color="inherit" size="small" onClick={onFilterClick}>
              Xem danh sách
            </Button>
          )
        }
      >
        <AlertTitle>Cảnh báo tồn kho</AlertTitle>
        {isFiltered 
          ? `Đang hiển thị ${count} loại thuốc sắp hết hàng.`
          : `Có ${count} loại thuốc sắp hết hàng (dưới ngưỡng cảnh báo).`
        }
      </Alert>
    </Collapse>
  );
}
