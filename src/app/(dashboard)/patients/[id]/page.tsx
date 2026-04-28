import React from 'react';
import { getPatientById } from '@/actions/patients';
import PatientDetail from '@/components/features/patients/PatientDetail';
import PageHeader from '@/components/ui/PageHeader';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PatientPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await getPatientById(Number(id));
  
  return {
    title: patient ? `Bệnh nhân: ${patient.name} | QLPK` : 'Không tìm thấy bệnh nhân | QLPK',
  };
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  const patient = await getPatientById(Number(id));

  if (!patient) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={patient.name}
        subtitle={`Mã bệnh nhân: #${patient.id}`}
      />
      <PatientDetail patient={patient} />
    </div>
  );
}
