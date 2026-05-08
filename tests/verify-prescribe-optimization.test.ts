import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Prescribe Page Performance Optimization Verification', () => {
  
  describe('Phase 01: Database Indexing', () => {
    it('should have GIN index migration file or check for it in migrations', () => {
      const migrationDir = path.resolve(process.cwd(), 'supabase/migrations');
      if (fs.existsSync(migrationDir)) {
        const files = fs.readdirSync(migrationDir);
        const ginMigration = files.find(f => f.toLowerCase().includes('trgm') || f.toLowerCase().includes('gin'));
        // If not found in filenames, check content of recent migrations
        if (!ginMigration) {
            const recentMigration = files.sort().pop();
            if (recentMigration) {
                const content = fs.readFileSync(path.join(migrationDir, recentMigration), 'utf8');
                expect(content.toLowerCase()).toMatch(/gin|pg_trgm/);
            }
        } else {
            expect(ginMigration).toBeDefined();
        }
      }
    });
  });

  describe('Phase 02: Server Actions Caching', () => {
    it('should use unstable_cache for getDrugPresets', () => {
      const actionPath = path.resolve(process.cwd(), 'src/actions/settings.ts');
      const content = fs.readFileSync(actionPath, 'utf8');
      
      expect(content).toContain('unstable_cache(');
      expect(content).toContain('getDrugPresets');
      expect(content).toContain("'settings'");
    });

    it('should use cached settings in getConsultationFee', () => {
      const actionPath = path.resolve(process.cwd(), 'src/actions/prescriptions.ts');
      const content = fs.readFileSync(actionPath, 'utf8');
      
      expect(content).toContain('getCachedSettings()');
    });
  });

  describe('Phase 03: UI & Fetching Refactor', () => {
    it('should use getPatientBasicInfo in Prescribe Page', () => {
      const pagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/patients/[id]/prescribe/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');
      
      expect(content).toContain('getPatientBasicInfo(patientId)');
      expect(content).not.toContain('getPatientById(patientId)');
    });

    it('should fetch presets on the server and pass to PrescriptionForm', () => {
      const pagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/patients/[id]/prescribe/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf8');
      
      expect(content).toContain('getDrugPresets()');
      expect(content).toContain('<PrescriptionForm');
      expect(content).toContain('presets={presets}');
    });

    it('should pass presets to DoseCalculator in PrescriptionForm', () => {
      const componentPath = path.resolve(process.cwd(), 'src/components/features/prescriptions/PrescriptionForm.tsx');
      const content = fs.readFileSync(componentPath, 'utf8');
      
      expect(content).toContain('<DoseCalculator');
      expect(content).toContain('presets={presets}');
    });

    it('should use presets from props in DoseCalculator and NOT fetch at client', () => {
      const componentPath = path.resolve(process.cwd(), 'src/components/features/dose-calculator/DoseCalculator.tsx');
      const content = fs.readFileSync(componentPath, 'utf8');
      
      expect(content).toContain('presets = []');
      // Should NOT contain fetching logic
      expect(content).not.toContain('getDrugPresets');
      expect(content).not.toContain('fetch(');
    });
  });
});
