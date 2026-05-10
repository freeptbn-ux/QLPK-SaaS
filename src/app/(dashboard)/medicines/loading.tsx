import MedicineTableSkeleton from '@/components/medicines/MedicineTableSkeleton';
import PageHeader from '@/components/ui/PageHeader';

export default function MedicinesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý Kho thuốc"
        subtitle="Danh sách thuốc, đơn giá và số lượng tồn kho"
      />
      <MedicineTableSkeleton />
    </div>
  );
}
