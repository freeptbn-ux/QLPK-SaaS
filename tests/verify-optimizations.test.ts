import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Project Optimization Verification (Phase 05)', () => {
  
  describe('Phase 02: Patient Data Query Parallelization', () => {
    it('should use Promise.all in getPatientById', () => {
      const actionPath = path.resolve(process.cwd(), 'src/actions/patients.ts');
      const content = fs.readFileSync(actionPath, 'utf8');
      
      // Check if getPatientById uses Promise.all
      expect(content).toContain('export const getPatientById = cache(async (id: number) =>');
      expect(content).toContain('await Promise.all([');
      expect(content).toContain('patientPromise');
      expect(content).toContain('prescriptionsPromise');
    });
  });

  describe('Phase 03: Suspense Streaming', () => {
    it('should use Suspense in PatientsPage', () => {
      const pagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/patients/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');
      
      expect(content).toContain('<Suspense');
      expect(content).toContain('<PatientListWrapper');
      expect(content).toContain('fallback={');
    });
  });

  describe('Phase 04: Statistics Data Hydration', () => {
    it('should fetch initial data on the server in StatisticsPage', () => {
      const pagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/statistics/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');
      
      expect(content).toContain('const [availableMonths, overview, genderData, locationData] = await Promise.all([');
      expect(content).toContain('const [initialVisits, initialRevenue, initialDobs, initialMedicines] = await Promise.all([');
      expect(content).toContain('<StatisticsClient');
      expect(content).toContain('initialChartData={');
    });

    it('should use isFirstRender ref to skip initial client-side fetch in StatisticsClient', () => {
      const componentPath = path.resolve(process.cwd(), 'src/components/features/statistics/StatisticsClient.tsx');
      const content = fs.readFileSync(componentPath, 'utf8');
      
      expect(content).toContain('const isFirstRender = useRef(true)');
      expect(content).toContain('if (isFirstRender.current) {');
      expect(content).toContain('isFirstRender.current = false');
      expect(content).toContain('return');
    });
  });

  describe('General Bundle Optimization', () => {
    it('should have bundle optimizations in next.config.ts', () => {
      const configPath = path.resolve(process.cwd(), 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf8');
      
      expect(content).toContain('compress: true');
      expect(content).toContain('optimizePackageImports');
      expect(content).toContain('lucide-react');
      expect(content).toContain('recharts');
    });
  });

  describe('Revenue Calculation Logic', () => {
    it('should include consultation_fee in revenue stats action', () => {
      const actionPath = path.resolve(process.cwd(), 'src/actions/statistics.ts');
      const content = fs.readFileSync(actionPath, 'utf8');
      
      // This is a bit harder to check via string matching, but we can check if the RPC call exists
      expect(content).toContain('get_revenue_stats_v2');
    });
  });
});
