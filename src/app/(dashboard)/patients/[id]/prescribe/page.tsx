import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import { getPatientById } from '@/actions/patients';
import { getConsultationFee } from '@/actions/prescriptions';
import PrescriptionForm from '@/components/features/prescriptions/PrescriptionForm';
import { notFound } from 'next/navigation';

interface PrescribePageProps {
  params: {
    id: string;
  };
}

export default async function PrescribePage({ params }: PrescribePageProps) {
  const patientId = parseInt(params.id);
  
  if (isNaN(patientId)) {
    notFound();
  }

  const [patient, consultationFee] = await Promise.all([
    getPatientById(patientId),
    getConsultationFee()
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/patients" underline="hover" color="inherit">
            Bệnh nhân
          </MuiLink>
          <MuiLink component={Link} href={`/patients/${patientId}`} underline="hover" color="inherit">
            {patient.name}
          </MuiLink>
          <Typography color="text.primary">Kê đơn thuốc</Typography>
        </Breadcrumbs>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Kê đơn thuốc mới
        </Typography>
      </Box>

      <PrescriptionForm patient={patient} consultationFee={consultationFee} />
    </Container>
  );
}
