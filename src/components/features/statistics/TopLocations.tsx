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

interface TopLocationsProps {
  data: { name: string; count: number }[];
}

export default function TopLocations({ data }: TopLocationsProps) {
  return (
    <Card elevation={2} sx={{ borderRadius: 4, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top 20 khu vực / địa chỉ
        </Typography>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Địa chỉ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số lượt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.count}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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
