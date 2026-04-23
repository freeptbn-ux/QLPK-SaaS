'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Medicine } from '@/types/database';
import { medicineSchema, MedicineFormData } from '@/lib/validations/medicine';
import { addMedicine, updateMedicine } from '@/actions/medicines';

interface MedicineFormDialogProps {
  open: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSuccess: () => void;
}

export default function MedicineFormDialog({
  open,
  onClose,
  medicine,
  onSuccess,
}: MedicineFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      packing_spec: '',
      price: 0,
      stock_quantity: 0,
      min_stock_level: 5,
    },
  });

  useEffect(() => {
    if (medicine) {
      reset({
        name: medicine.name,
        packing_spec: medicine.packing_spec || '',
        price: medicine.price,
        stock_quantity: medicine.stock_quantity,
        min_stock_level: medicine.min_stock_level,
      });
    } else {
      reset({
        name: '',
        packing_spec: '',
        price: 0,
        stock_quantity: 0,
        min_stock_level: 5,
      });
    }
  }, [medicine, reset, open]);

  const onSubmit = async (data: MedicineFormData) => {
    try {
      if (medicine) {
        await updateMedicine(medicine.id, data);
      } else {
        await addMedicine(data);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.message === 'Tên thuốc đã tồn tại') {
        setError('name', { message: error.message });
      } else {
        console.error('Submit error:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{medicine ? 'Sửa thông tin thuốc' : 'Thêm thuốc mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                {...register('name')}
                label="Tên thuốc"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                {...register('packing_spec')}
                label="Quy cách đóng gói"
                fullWidth
                error={!!errors.packing_spec}
                helperText={errors.packing_spec?.message}
                placeholder="VD: Hộp 30 viên, Chai 100ml..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('price')}
                label="Đơn giá"
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('min_stock_level')}
                label="Ngưỡng cảnh báo"
                type="number"
                fullWidth
                error={!!errors.min_stock_level}
                helperText={errors.min_stock_level?.message || "Hiện cảnh báo khi tồn kho ≤ mức này"}
              />
            </Grid>
            {!medicine && (
               <Grid size={{ xs: 12 }}>
               <TextField
                 {...register('stock_quantity')}
                 label="Số lượng tồn kho ban đầu"
                 type="number"
                 fullWidth
                 error={!!errors.stock_quantity}
                 helperText={errors.stock_quantity?.message}
               />
             </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {medicine ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
