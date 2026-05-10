import React from 'react';
import { getPatientPrescriptionsPaginated } from '@/actions/patients';
import PrescriptionHistory from './PrescriptionHistory';

interface PrescriptionSectionProps {
  patientId: number;
  patientName: string;
}

export default async function PrescriptionSection({ patientId, patientName }: PrescriptionSectionProps) {
  // Fetch prescriptions with initial page (page 1, pageSize 10)
  const result = await getPatientPrescriptionsPaginated(patientId, 1, 10);

  return (
    <PrescriptionHistory 
      patientId={patientId}
      patientName={patientName}
      prescriptions={result.data}
      totalCount={result.count || 0}
    />
  );
}
