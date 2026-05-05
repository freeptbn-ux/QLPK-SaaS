import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import PatientListClient from '@/components/features/patients/PatientListClient';
import { Metadata } from 'next';
import { getPatientsPaginated, searchPatients } from '@/actions/patients';

export const metadata: Metadata = {
  title: 'Quản lý bệnh nhân | QLPK',
  description: 'Danh sách và quản lý hồ sơ bệnh nhân',
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; size?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.size || '50', 10);

  const result = query
    ? await searchPatients(query, page, pageSize)
    : await getPatientsPaginated(page, pageSize);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bệnh nhân"
        subtitle="Quản lý danh sách hồ sơ và lịch sử khám của bệnh nhân"
      />
      <PatientListClient
        initialData={result.data}
        totalCount={result.count || 0}
        currentPage={page}
        currentSize={pageSize}
        searchQuery={query}
      />
    </div>
  );
}
