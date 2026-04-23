import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SettingsForm from '@/components/features/settings/SettingsForm';
import { getAllSettings } from '@/actions/settings';

export default async function SettingsPage() {
  const initialSettings = await getAllSettings();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Cài đặt
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin phòng khám và cấu hình ứng dụng
        </Typography>
      </Box>

      <SettingsForm initialSettings={initialSettings} />
    </Container>
  );
}
