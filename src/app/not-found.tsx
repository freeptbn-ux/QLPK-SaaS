import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
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
        <Typography variant="h1" color="primary" sx={{ fontSize: '8rem', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
          Không tìm thấy trang
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button
            component="span"
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
          >
            Quay lại trang chủ
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
