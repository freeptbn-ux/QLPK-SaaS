'use client';

import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  IconButton, 
  Stack,
  useTheme
} from '@mui/material';
import { 
  Brightness4 as DarkIcon, 
  Brightness7 as LightIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useThemeContext } from '@/theme/ThemeContext';

export default function Home() {
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();

  const hasSupabaseKeys = 
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}
        >
          <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
            </IconButton>
          </Stack>

          <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
            QLPK SaaS
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Hệ thống quản lý phòng khám Nhi khoa thông minh.
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" size="large" color="primary">
              Bắt đầu ngay
            </Button>
            <Button variant="outlined" size="large">
              Tài liệu hướng dẫn
            </Button>
          </Box>

          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Trạng thái hệ thống
            </Typography>
            <Stack direction="row" sx={{ spacing: 3, justifyContent: 'center', mt: 2 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <SuccessIcon color="success" fontSize="small" />
                <Typography variant="body2">MUI Theme: Ready</Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                {hasSupabaseKeys ? (
                  <SuccessIcon color="success" fontSize="small" />
                ) : (
                  <ErrorIcon color="warning" fontSize="small" />
                )}
                <Typography variant="body2">
                  Supabase: {hasSupabaseKeys ? 'Configured' : 'Missing Keys in .env.local'}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
