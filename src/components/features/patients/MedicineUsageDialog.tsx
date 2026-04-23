'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Box,
  CircularProgress,
} from '@mui/material';
import { getMedicineUsageByPatient } from '@/actions/patients';

interface MedicineUsageDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
}

export default function MedicineUsageDialog({ open, onClose, patientId, patientName }: MedicineUsageDialogProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getMedicineUsageByPatient(patientId)
        .then(setData)
        .catch(err => {
          console.error('Failed to fetch medicine usage:', err);
          setData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, patientId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Lịch sử dùng thuốc: {patientName}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Chưa có lịch sử dùng thuốc
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Tên thuốc</TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>Số lần kê</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => {
                  const isBold = row.times_prescribed >= 3;
                  return (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                        {row.medicine_name}
                        {row.packing_spec && (
                          <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                            {row.packing_spec}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                        {row.times_prescribed}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
