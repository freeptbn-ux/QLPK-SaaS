'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box
} from '@mui/material';

interface MedicineUsageTableProps {
  data: { name: string; totalQuantity: number; totalRevenue: number }[];
}

export default function MedicineUsageTable({ data }: MedicineUsageTableProps) {
  return (
    <Card elevation={2} sx={{ borderRadius: 4, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thuốc sử dụng nhiều nhất
        </Typography>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tên thuốc</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tổng SL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.totalQuantity}</TableCell>
                  <TableCell align="right">
                    {row.totalRevenue.toLocaleString('vi-VN')} đ
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
