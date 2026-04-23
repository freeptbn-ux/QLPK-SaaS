'use client';

import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: '60vh',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Lỗi tải trang
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Chúng tôi gặp sự cố khi hiển thị nội dung này. Bạn có thể thử tải lại trang.
        </Typography>
        <Button
          variant="contained"
          onClick={() => reset()}
          sx={{ mt: 2 }}
        >
          Tải lại
        </Button>
      </Paper>
    </Box>
  );
}
