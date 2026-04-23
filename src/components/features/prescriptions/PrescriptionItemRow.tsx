'use client';

import React from 'react';
import { TableRow, TableCell, TextField, IconButton, Typography } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { PrescriptionItem } from '@/types/forms';

interface PrescriptionItemRowProps {
  item: PrescriptionItem;
  index: number;
  onUpdate: (index: number, updates: Partial<PrescriptionItem>) => void;
  onRemove: (index: number) => void;
}

export default function PrescriptionItemRow({ item, index, onUpdate, onRemove }: PrescriptionItemRowProps) {
  const total = item.quantity * item.unit_price;

  return (
    <TableRow>
      <TableCell sx={{ minWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {item.medicine_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.packing_spec}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: 100 }}>
        <TextField
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate(index, { quantity: parseInt(e.target.value) || 0 })}
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120 }}>
        <TextField
          type="number"
          value={item.unit_price}
          onChange={(e) => onUpdate(index, { unit_price: parseInt(e.target.value) || 0 })}
          size="small"
          fullWidth
          label="Đơn giá"
        />
      </TableCell>
      <TableCell sx={{ minWidth: 120, textAlign: 'right' }}>
        <Typography variant="body2">
          {new Intl.NumberFormat('vi-VN').format(total)}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: 50 }}>
        <IconButton size="small" color="error" onClick={() => onRemove(index)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
