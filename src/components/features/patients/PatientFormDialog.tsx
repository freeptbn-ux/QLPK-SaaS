'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import { patientSchema, PatientSchemaType } from '@/lib/validations/patient';
import { Patient } from '@/types/database';
import { addPatient, updatePatient } from '@/actions/patients';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess: () => void;
}

export default function PatientFormDialog({
  open,
  onClose,
  patient,
  onSuccess,
}: PatientFormDialogProps) {
  const isEdit = !!patient;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientSchemaType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      dob: '',
      gender: 'Nam',
      address: '',
      phone: '',
      weight: '',
      diagnosis: '',
    },
  });

  useEffect(() => {
    if (patient && open) {
      reset({
        name: patient.name || '',
        dob: patient.dob || '',
        gender: (patient.gender as 'Nam' | 'Nữ' | '') || 'Nam',
        address: patient.address || '',
        phone: patient.phone || '',
        weight: patient.weight || '',
        diagnosis: patient.diagnosis || '',
      });
    } else if (!patient && open) {
      reset({
        name: '',
        dob: '',
        gender: 'Nam',
        address: '',
        phone: '',
        weight: '',
        diagnosis: '',
      });
    }
  }, [patient, open, reset]);

  const onSubmit = async (data: PatientSchemaType) => {
    try {
      if (isEdit && patient) {
        await updatePatient(patient.id, data);
      } else {
        await addPatient(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      // You might want to show a toast message here
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Cập nhật bệnh nhân' : 'Thêm bệnh nhân mới'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Họ và tên"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ngày sinh / Tuổi"
                    fullWidth
                    placeholder="Ví dụ: 1990 hoặc 12 tháng"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Giới tính</FormLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="Nam" control={<Radio />} label="Nam" />
                      <FormControlLabel value="Nữ" control={<Radio />} label="Nữ" />
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <TextField {...field} label="Số điện thoại" fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => <TextField {...field} label="Cân nặng (kg)" fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => <TextField {...field} label="Địa chỉ" fullWidth multiline rows={2} />}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="diagnosis"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Chẩn đoán / Ghi chú" fullWidth multiline rows={3} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
