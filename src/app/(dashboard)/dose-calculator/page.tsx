import { Container, Typography, Box } from '@mui/material';
import PageHeader from '@/components/ui/PageHeader';
import DoseCalculator from '@/components/features/dose-calculator/DoseCalculator';
import DrugPresetManager from '@/components/features/dose-calculator/DrugPresetManager';

export const metadata = {
  title: 'Tính liều thuốc - QLPK SaaS',
};

export default function DoseCalculatorPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader 
        title="Tính liều thuốc nhi khoa" 
        subtitle="Công cụ hỗ trợ tính liều siro/hỗn dịch cho trẻ em" 
      />
      
      <DoseCalculator />
      
      <Box sx={{ mt: 6 }}>
        <DrugPresetManager />
      </Box>
    </Container>
  );
}
