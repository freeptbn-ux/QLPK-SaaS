'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { Medicine } from '@/types/database';
import { updateMedicineStock } from '@/actions/medicines';

interface StockAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSuccess: () => void;
}

export default function StockAdjustDialog({ open, onClose, medicine, onSuccess }: StockAdjustDialogProps) {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAdjustment(0);
      setError(null);
    }
  }, [open]);

  if (!medicine) return null;

  const handleAdjust = async () => {
    setLoading(true);
    setError(null);
    try {
      const newQuantity = medicine.stock_quantity + adjustment;
      if (newQuantity < 0) {
        setError('Số lượng tồn kho không thể âm');
        setLoading(false);
        return;
      }
      await updateMedicineStock(medicine.id, newQuantity);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Không thể cập nhật tồn kho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Thuốc: {medicine.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tồn hiện tại: {medicine.stock_quantity}
          </Typography>
          
          <TextField
            fullWidth
            label="Số lượng nhập thêm"
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
            sx={{ mt: 2 }}
            error={!!error}
            helperText={error || "Nhập số dương để tăng, số âm để giảm"}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">+</InputAdornment>,
              }
            }}
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2">
              Tồn kho mới: <strong>{medicine.stock_quantity + adjustment}</strong>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button onClick={handleAdjust} variant="contained" loading={loading}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
}
