'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Print as PrintIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { PrescriptionHeader, PrescriptionDetail, Medicine } from '@/types/database';
import dayjs from 'dayjs';
import Link from 'next/link';
import MedicineAutocomplete from '../prescriptions/MedicineAutocomplete';
import { PrescriptionItem } from '@/types/forms';
import { appendToPrescription } from '@/actions/prescriptions';

interface PrescriptionWithDetails extends PrescriptionHeader {
  prescription_details: (PrescriptionDetail & { medicines: Pick<Medicine, 'name' | 'packing_spec'> })[];
}

interface PrescriptionHistoryProps {
  patientId: number;
  prescriptions: PrescriptionWithDetails[];
}

export default function PrescriptionHistory({ patientId, prescriptions }: PrescriptionHistoryProps) {
  const [appendDialogOpen, setAppendDialogOpen] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  const [itemsToAppend, setItemsToAppend] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isToday = (date: string) => dayjs(date).isSame(dayjs(), 'day');

  const handleOpenAppend = (prescriptionId: number) => {
    setSelectedPrescriptionId(prescriptionId);
    setItemsToAppend([]);
    setAppendDialogOpen(true);
  };

  const handleAddMedicine = (medicine: Medicine | null) => {
    if (!medicine) return;
    
    // Check if already in append list
    if (itemsToAppend.some(i => i.medicine_id === medicine.id)) return;

    setItemsToAppend([...itemsToAppend, {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      packing_spec: medicine.packing_spec || '',
      quantity: 1,
      unit_price: medicine.price
    }]);
  };

  const handleRemoveAppendItem = (id: number) => {
    setItemsToAppend(itemsToAppend.filter(i => i.medicine_id !== id));
  };

  const handleUpdateAppendItem = (id: number, qty: number) => {
    setItemsToAppend(itemsToAppend.map(i => i.medicine_id === id ? { ...i, quantity: qty } : i));
  };

  const handleAppendSubmit = async () => {
    if (!selectedPrescriptionId || itemsToAppend.length === 0) return;

    setLoading(true);
    try {
      const result = await appendToPrescription(selectedPrescriptionId, itemsToAppend, patientId);
      if (result.success) {
        setAppendDialogOpen(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Lỗi khi thêm thuốc');
    } finally {
      setLoading(false);
    }
  };

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
        <HospitalIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary" gutterBottom>Chưa có lịch sử đơn thuốc</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href={`/patients/${patientId}/prescribe`}
          sx={{ mt: 2 }}
        >
          Kê đơn đầu tiên
        </Button>
      </Box>
    );
  }

  const sortedPrescriptions = [...prescriptions].sort((a, b) => 
    dayjs(b.prescription_date).unix() - dayjs(a.prescription_date).unix()
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h6">
          Lịch sử khám bệnh ({prescriptions.length} lần)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href={`/patients/${patientId}/prescribe`}
        >
          Kê đơn mới
        </Button>
      </Box>

      <Stack spacing={2}>
        {sortedPrescriptions.map((p) => (
          <Accordion key={p.id} variant="outlined" sx={{ borderRadius: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center', pr: 2 }}>
                <Box sx={{ minWidth: 100 }}>
                  <Typography variant="subtitle2" color="primary">
                    {dayjs(p.prescription_date).format('DD/MM/YYYY')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    #{p.id}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                  {p.diagnosis || 'Không có chẩn đoán'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {isToday(p.prescription_date) && (
                    <Chip label="Hôm nay" color="success" size="small" variant="filled" />
                  )}
                  <Chip
                    label={`${p.total_amount.toLocaleString()} đ`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Chi tiết thuốc:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell>Tên thuốc</TableCell>
                        <TableCell align="right">SL</TableCell>
                        <TableCell align="right">Đơn giá</TableCell>
                        <TableCell align="right">Thành tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {p.prescription_details?.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>
                            {detail.medicines?.name}
                            <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                              {detail.medicines?.packing_spec}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{detail.quantity}</TableCell>
                          <TableCell align="right">{(detail.unit_price || 0).toLocaleString()} đ</TableCell>
                          <TableCell align="right">
                            {(detail.quantity * (detail.unit_price || 0)).toLocaleString()} đ
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Tiền thuốc:</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {(p.total_amount - (p.consultation_fee || 0)).toLocaleString()} đ
                        </TableCell>
                      </TableRow>
                      {p.consultation_fee > 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ color: 'text.secondary' }}>Phí khám:</TableCell>
                          <TableCell align="right" sx={{ color: 'text.secondary' }}>
                            {p.consultation_fee.toLocaleString()} đ
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>Tổng cộng:</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
                          {p.total_amount.toLocaleString()} đ
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Ghi chú:</strong> {p.notes || 'Không có ghi chú'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                  <Button size="small" startIcon={<PrintIcon />}>
                    In đơn thuốc
                  </Button>
                  {isToday(p.prescription_date) && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenAppend(p.id)}
                    >
                      Thêm thuốc
                    </Button>
                  )}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {/* Append Dialog */}
      <Dialog open={appendDialogOpen} onClose={() => setAppendDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm thuốc vào đơn #{selectedPrescriptionId}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Chọn thuốc muốn thêm:</Typography>
            <MedicineAutocomplete onSelect={handleAddMedicine} />
          </Box>
          
          {itemsToAppend.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Thuốc</TableCell>
                    <TableCell align="right" sx={{ width: 80 }}>SL</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemsToAppend.map((item) => (
                    <TableRow key={item.medicine_id}>
                      <TableCell>{item.medicine_name}</TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleUpdateAppendItem(item.medicine_id, parseInt(e.target.value) || 1)}
                          slotProps={{ htmlInput: { min: 1, style: { textAlign: 'right', padding: '4px' } } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleRemoveAppendItem(item.medicine_id)}>
                          <AddIcon sx={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppendDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            disabled={itemsToAppend.length === 0 || loading}
            onClick={handleAppendSubmit}
          >
            {loading ? 'Đang lưu...' : 'Lưu thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
