import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import PatientList from '@/components/features/patients/PatientList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý bệnh nhân | QLPK',
  description: 'Danh sách và quản lý hồ sơ bệnh nhân',
};

export default function PatientsPage() {
  return (
    <div>
      <PageHeader
        title="Bệnh nhân"
        subtitle="Quản lý danh sách hồ sơ và lịch sử khám của bệnh nhân"
      />
      <PatientList />
    </div>
  );
}
