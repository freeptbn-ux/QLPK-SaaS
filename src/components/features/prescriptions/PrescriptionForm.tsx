'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MedicineAutocomplete from './MedicineAutocomplete';
import PrescriptionItemRow from './PrescriptionItemRow';
import { PrescriptionItem, CreatePrescriptionData } from '@/types/forms';
import { Patient, Medicine } from '@/types/database';
import { createPrescription } from '@/actions/prescriptions';
import { formatAge } from '@/lib/utils/age';
import { GLASSMORPHISM } from '@/theme/constants';
import CountUp from '@/components/ui/CountUp';


interface PrescriptionFormProps {
  patient: Patient;
  consultationFee: number;
}

export default function PrescriptionForm({ patient, consultationFee }: PrescriptionFormProps) {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis || '');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMedicine = (medicine: Medicine | null) => {
    if (!medicine) return;

    // Check if already added
    if (items.some((item) => item.medicine_id === medicine.id)) {
      setError('Thuốc này đã có trong đơn');
      return;
    }

    const newItem: PrescriptionItem = {
      medicine_id: medicine.id,
      medicine_name: medicine.name,
      packing_spec: medicine.packing_spec || '',
      quantity: 1,
      unit_price: medicine.price,
    };

    setItems([...items, newItem]);
    setError(null);
  };

  const handleUpdateItem = (index: number, updates: Partial<PrescriptionItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + consultationFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) {
      setError('Vui lòng nhập chẩn đoán');
      return;
    }
    if (items.length === 0) {
      setError('Vui lòng chọn ít nhất một loại thuốc');
      return;
    }

    setLoading(true);
    setError(null);

    const data: CreatePrescriptionData = {
      patient_id: patient.id,
      diagnosis,
      items,
      notes,
      consultation_fee: consultationFee,
    };

    try {
      const result = await createPrescription(data);
      if (result.success) {
        router.push(`/patients/${patient.id}`);
        router.refresh();
      } else {
        setError(result.error || 'Có lỗi xảy ra khi lưu đơn thuốc');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Left Column: Form Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin đơn thuốc
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Chẩn đoán"
                    fullWidth
                    required
                    multiline
                    rows={2}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Ví dụ: Viêm họng cấp, Sốt siêu vi..."
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Chọn thuốc
                    </Typography>
                    <MedicineAutocomplete
                      onSelect={handleAddMedicine}
                      excludeIds={items.map((i) => i.medicine_id)}
                    />
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell>Tên thuốc</TableCell>
                          <TableCell>SL</TableCell>
                          <TableCell>Đơn giá</TableCell>
                          <TableCell align="right">Thành tiền</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                              <Typography color="text.secondary">Chưa có thuốc nào được chọn</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          items.map((item, index) => (
                            <PrescriptionItemRow
                              key={item.medicine_id}
                              item={item}
                              index={index}
                              onUpdate={handleUpdateItem}
                              onRemove={handleRemoveItem}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Ghi chú thêm"
                    fullWidth
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Summary & Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bệnh nhân
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patient.gender} • {formatAge(patient.dob || '') || 'Không rõ tuổi'}
                </Typography>
                {patient.weight && (
                  <Typography variant="body2" color="text.secondary">
                    Cân nặng: {patient.weight} kg
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card 
              elevation={0} 
              sx={{ 
                background: (theme) => theme.palette.mode === 'dark' ? GLASSMORPHISM.backgroundColorDark : GLASSMORPHISM.backgroundColor,
                backdropFilter: GLASSMORPHISM.blur,
                WebkitBackdropFilter: GLASSMORPHISM.blur,
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? GLASSMORPHISM.borderColorDark : GLASSMORPHISM.borderColor,
                boxShadow: GLASSMORPHISM.boxShadow,
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  Thanh toán
                </Typography>
                
                {/* Chi tiết phí được ẩn theo yêu cầu Phase 02 */}
                {/* 
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Tiền thuốc:</Typography>
                  <Typography>{new Intl.NumberFormat('vi-VN').format(subtotal)} đ</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Phí khám:</Typography>
                  <Typography>{new Intl.NumberFormat('vi-VN').format(consultationFee)} đ</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                */}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Tổng cộng:</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    <CountUp value={total} />
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  onClick={handleSubmit}
                  sx={{ 
                    mb: 2, 
                    py: 1.5,
                    fontSize: '1.05rem',
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
                    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1e40af 30%, #2563eb 90%)',
                      boxShadow: '0 12px 20px rgba(37, 99, 235, 0.35)',
                    }
                  }}
                >
                  Lưu đơn thuốc
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.back()}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  Quay lại
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
