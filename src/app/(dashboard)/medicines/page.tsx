import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import React, { Suspense } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import MedicineList, { StockFilter } from '@/components/features/medicines/MedicineList';
import { getAllMedicines, getLowStockCount, getOutOfStockCount } from '@/actions/medicines';
import MedicineTableSkeleton from '@/components/medicines/MedicineTableSkeleton';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  const clinicName = settings.clinic_name || 'Phòng khám';
  return {
    title: `Quản lý thuốc - ${clinicName}`,
    description: 'Danh mục và quản lý tồn kho thuốc',
  };
}

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; stock?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const stock = (params.stock || 'all') as StockFilter;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý Kho thuốc"
        subtitle="Danh sách thuốc, đơn giá và số lượng tồn kho"
      />
      
      <div className="">
        <Suspense fallback={<MedicineTableSkeleton />}>
          <MedicineListWrapper page={page} search={search} stock={stock} />
        </Suspense>
      </div>
    </div>
  );
}

async function MedicineListWrapper({ 
  page, 
  search, 
  stock 
}: { 
  page: number; 
  search: string; 
  stock: StockFilter;
}) {
  const [{ data, count, limit }, lowStockCount, outOfStockCount] = await Promise.all([
    getAllMedicines({ page, search, stockFilter: stock }),
    getLowStockCount().catch(() => 0),
    getOutOfStockCount().catch(() => 0)
  ]);

  return (
    <MedicineList 
      initialData={data} 
      totalCount={count} 
      currentPage={page} 
      limit={limit} 
      totalLowStockCount={lowStockCount}
      totalOutOfStockCount={outOfStockCount}
      currentStockFilter={stock}
    />
  );
}
