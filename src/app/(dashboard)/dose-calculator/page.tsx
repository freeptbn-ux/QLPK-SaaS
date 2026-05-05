import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import PageHeader from '@/components/ui/PageHeader';
import DoseCalculator from '@/components/features/dose-calculator/DoseCalculator';
import DrugPresetManager from '@/components/features/dose-calculator/DrugPresetManager';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  const clinicName = settings.clinic_name || 'Phòng khám';
  return {
    title: `Tính liều thuốc - ${clinicName}`,
  };
}

export default function DoseCalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Tính liều thuốc nhi khoa" 
        subtitle="Công cụ hỗ trợ tính liều siro/hỗn dịch cho trẻ em" 
      />
      
      <div className="">
        <DoseCalculator />
      </div>
      
      <div className="">
        <DrugPresetManager />
      </div>
    </div>
  );
}
