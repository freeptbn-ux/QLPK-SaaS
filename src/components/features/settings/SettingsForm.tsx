'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useToast } from '@/hooks/useToast';
import { updateMultipleSettings, changePassword } from '@/actions/settings';
import { useThemeContext } from '@/theme/ThemeContext';

const settingsSchema = z.object({
  clinic_name: z.string().min(1, 'Tên phòng khám là bắt buộc'),
  doctor_name: z.string().min(1, 'Tên bác sĩ là bắt buộc'),
  consultation_fee: z.coerce.number().min(0, 'Phí khám không được âm'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type SettingsValues = z.infer<typeof settingsSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { showToast } = useToast();
  const { mode, toggleTheme } = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      clinic_name: initialSettings.clinic_name || '',
      doctor_name: initialSettings.doctor_name || '',
      consultation_fee: Number(initialSettings.consultation_fee) || 0,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSettingsSubmit = async (data: any) => {
    const values = data as SettingsValues;
    setIsSubmitting(true);
    try {
      await updateMultipleSettings({
        clinic_name: values.clinic_name,
        doctor_name: values.doctor_name,
        consultation_fee: values.consultation_fee.toString(),
      });
      showToast('Cập nhật cài đặt thành công', 'success');
    } catch (error) {
      showToast('Lỗi khi cập nhật cài đặt', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setIsChangingPassword(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      showToast('Đổi mật khẩu thành công', 'success');
      resetPassword();
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi đổi mật khẩu', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <form onSubmit={handleSubmit(onSettingsSubmit)}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Thông tin phòng khám" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Tên phòng khám"
                    {...register('clinic_name')}
                    error={!!errors.clinic_name}
                    helperText={errors.clinic_name?.message}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Tên bác sĩ"
                    {...register('doctor_name')}
                    error={!!errors.doctor_name}
                    helperText={errors.doctor_name?.message}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader title="Tài chính" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phí khám"
                    type="number"
                    {...register('consultation_fee')}
                    error={!!errors.consultation_fee}
                    helperText={errors.consultation_fee?.message}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              Lưu thay đổi
            </Button>
          </Box>
        </form>

        <Card sx={{ mb: 3 }}>
          <CardHeader title="Giao diện" />
          <Divider />
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={mode === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader title="Đổi mật khẩu" />
          <Divider />
          <CardContent>
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    type="password"
                    {...registerPassword('currentPassword')}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    type="password"
                    {...registerPassword('newPassword')}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                  />
                </Grid>
                <Grid size={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="outlined"
                    color="primary"
                    disabled={isChangingPassword}
                    startIcon={isChangingPassword ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    Cập nhật mật khẩu
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
