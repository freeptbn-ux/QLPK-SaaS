import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import React, { Suspense } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import MedicineList from '@/components/features/medicines/MedicineList';
import { getAllMedicines } from '@/actions/medicines';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  const clinicName = settings.clinic_name || 'Phòng khám';
  return {
    title: `Quản lý thuốc - ${clinicName}`,
    description: 'Danh mục và quản lý tồn kho thuốc',
  };
}

async function MedicineListWrapper() {
  const medicines = await getAllMedicines();
  return <MedicineList initialData={medicines} />;
}

export default function MedicinesPage() {
  const tableHeaders = [
    { label: 'Tên thuốc' },
    { label: 'Quy cách' },
    { label: 'Giá (VNĐ)', className: 'text-right' },
    { label: 'Tồn kho', className: 'text-right' },
    { label: 'Trạng thái', className: 'text-center' },
    { label: 'Thao tác', className: 'text-right' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý Kho thuốc"
        subtitle="Danh sách thuốc, đơn giá và số lượng tồn kho"
      />
      
      <div className="">
        <Suspense fallback={
          <TableSkeleton rows={10} columns={6} headers={tableHeaders} />
        }>
          <MedicineListWrapper />
        </Suspense>
      </div>
    </div>
  );
}

