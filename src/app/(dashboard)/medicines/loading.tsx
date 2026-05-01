import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';

export default function MedicinesLoading() {
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
        <TableSkeleton rows={10} columns={6} headers={tableHeaders} />
      </div>
    </div>
  );
}
