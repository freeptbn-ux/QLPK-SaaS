import React, { Suspense } from 'react';
import { Box, Container } from '@mui/material';
import PageHeader from '@/components/ui/PageHeader';
import MedicineList from '@/components/features/medicines/MedicineList';
import { getAllMedicines } from '@/actions/medicines';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import InventoryIcon from '@mui/icons-material/Inventory';

export const metadata = {
  title: 'Quản lý thuốc - QLPK SaaS',
  description: 'Danh mục và quản lý tồn kho thuốc',
};

async function MedicineListWrapper() {
  const medicines = await getAllMedicines();
  return <MedicineList initialData={medicines} />;
}

export default function MedicinesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Quản lý Kho thuốc"
        subtitle="Danh sách thuốc, đơn giá và số lượng tồn kho"
      />
      
      <Box sx={{ mt: 4 }}>
        <Suspense fallback={
          <Box sx={{ p: 2 }}>
            <LoadingSkeleton rows={10} columns={6} />
          </Box>
        }>
          <MedicineListWrapper />
        </Suspense>
      </Box>
    </Container>
  );
}
