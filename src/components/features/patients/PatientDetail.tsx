'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { Patient, PrescriptionHeader } from '@/types/database';
import { useRouter } from 'next/navigation';
import PrescriptionHistory from './PrescriptionHistory';
import PatientFormDialog from './PatientFormDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deletePatient } from '@/actions/patients';

interface PatientDetailProps {
  patient: any; // Using any for simplicity as the join makes it complex, or could define a proper type
}

export default function PatientDetail({ patient }: PatientDetailProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient);

  const handleDelete = async () => {
    try {
      await deletePatient(patient.id);
      router.push('/patients');
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const handleUpdateSuccess = () => {
    // In a real app, you might want to refresh the data or use a more sophisticated state management
    // For now, we'll just redirect to the list or rely on revalidatePath in server actions
    router.refresh();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/patients')}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Thông tin bệnh nhân
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setFormOpen(true)}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Xóa
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Họ và tên
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {currentPatient.name}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Giới tính
              </Typography>
              <Typography variant="body1">{currentPatient.gender || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Ngày sinh / Tuổi
              </Typography>
              <Typography variant="body1">{currentPatient.dob || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Số điện thoại
              </Typography>
              <Typography variant="body1">{currentPatient.phone || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Địa chỉ
              </Typography>
              <Typography variant="body1">{currentPatient.address || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Cân nặng
              </Typography>
              <Typography variant="body1">{currentPatient.weight ? `${currentPatient.weight} kg` : 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Chẩn đoán gần nhất
              </Typography>
              <Typography variant="body1">{currentPatient.diagnosis || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <PrescriptionHistory 
        patientId={currentPatient.id} 
        prescriptions={currentPatient.prescriptions || []} 
      />

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={currentPatient}
        onSuccess={handleUpdateSuccess}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bệnh nhân "${currentPatient.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
}
