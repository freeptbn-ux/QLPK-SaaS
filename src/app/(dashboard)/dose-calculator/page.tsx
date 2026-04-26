import PageHeader from '@/components/ui/PageHeader';
import DoseCalculator from '@/components/features/dose-calculator/DoseCalculator';
import DrugPresetManager from '@/components/features/dose-calculator/DrugPresetManager';

export const metadata = {
  title: 'Tính liều thuốc - QLPK SaaS',
};

export default function DoseCalculatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader 
        title="Tính liều thuốc nhi khoa" 
        subtitle="Công cụ hỗ trợ tính liều siro/hỗn dịch cho trẻ em" 
      />
      
      <div className="mt-8">
        <DoseCalculator />
      </div>
      
      <div className="mt-12">
        <DrugPresetManager />
      </div>
    </div>
  );
}
