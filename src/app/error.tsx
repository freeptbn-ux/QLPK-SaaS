'use client';

import React, { useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h2" color="error" sx={{ fontWeight: 'bold' }}>
          Đã có lỗi xảy ra!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error.message || 'Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại sau.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => reset()}
          >
            Thử lại
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/'}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
