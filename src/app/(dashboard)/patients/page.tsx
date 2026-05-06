import React, { Suspense } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import PatientListClient from '@/components/features/patients/PatientListClient';
import { Metadata } from 'next';
import { getPatientsPaginated, searchPatients } from '@/actions/patients';
import { BallLoader } from '@/components/Loading';

export const metadata: Metadata = {
  title: 'Quản lý bệnh nhân | QLPK',
  description: 'Danh sách và quản lý hồ sơ bệnh nhân',
};

async function PatientListWrapper({
  query,
  page,
  pageSize,
}: {
  query: string;
  page: number;
  pageSize: number;
}) {
  const result = query
    ? await searchPatients(query, page, pageSize)
    : await getPatientsPaginated(page, pageSize);

  return (
    <PatientListClient
      initialData={result.data}
      totalCount={result.count || 0}
      currentPage={page}
      currentSize={pageSize}
      searchQuery={query}
    />
  );
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; size?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.size || '50', 10);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bệnh nhân"
        subtitle="Quản lý danh sách hồ sơ và lịch sử khám của bệnh nhân"
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-20">
            <BallLoader size="lg" text="Đang tải danh sách bệnh nhân..." />
          </div>
        }
      >
        <PatientListWrapper query={query} page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}

