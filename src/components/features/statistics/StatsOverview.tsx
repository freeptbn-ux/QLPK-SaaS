'use client';

import { Card, CardContent, Grid, Typography, Box, Skeleton } from '@mui/material';
import { 
  People as PeopleIcon, 
  Receipt as ReceiptIcon, 
  AttachMoney as MoneyIcon, 
  Warning as WarningIcon 
} from '@mui/icons-material';

interface StatsOverviewProps {
  stats: {
    totalPatients: number;
    monthlyVisits: number;
    monthlyRevenue: number;
    lowStockCount: number;
  } | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const items = [
    {
      title: 'Tổng bệnh nhân',
      value: stats?.totalPatients ?? 0,
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.light',
    },
    {
      title: 'Lượt khám tháng này',
      value: stats?.monthlyVisits ?? 0,
      icon: <ReceiptIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light',
    },
    {
      title: 'Doanh thu tháng này',
      value: (stats?.monthlyRevenue ?? 0).toLocaleString('vi-VN') + ' đ',
      icon: <MoneyIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.light',
    },
    {
      title: 'Thuốc sắp hết',
      value: stats?.lowStockCount ?? 0,
      icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light',
    },
  ];

  return (
    <Grid container spacing={3}>
      {items.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card elevation={2} sx={{ borderRadius: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats ? item.value : <Skeleton width={100} />}
                  </Typography>
                </Box>
                <Box sx={{ 
                  backgroundColor: item.color, 
                  borderRadius: '50%', 
                  p: 1.5, 
                  display: 'flex',
                  opacity: 0.8
                }}>
                  {item.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
