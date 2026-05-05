import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import React, { Suspense } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import MedicineList from '@/components/features/medicines/MedicineList';
import { getAllMedicines } from '@/actions/medicines';
import { LoadingReporter } from '@/components/Loading';

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
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý Kho thuốc"
        subtitle="Danh sách thuốc, đơn giá và số lượng tồn kho"
      />
      
      <div className="">
        <Suspense fallback={<LoadingReporter text="Đang tải danh mục thuốc..." />}>
          <MedicineListWrapper />
        </Suspense>
      </div>
    </div>
  );
}

