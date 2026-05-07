import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 01 Quick Wins Verification', () => {
  
  describe('Task 2: Skeleton Loading UI', () => {
    it('should have src/app/(dashboard)/patients/[id]/loading.tsx', () => {
      const loadingPath = path.resolve(process.cwd(), 'src/app/(dashboard)/patients/[id]/loading.tsx');
      expect(fs.existsSync(loadingPath)).toBe(true);
    });

    it('should use animate-pulse and have skeleton blocks', () => {
      const loadingPath = path.resolve(process.cwd(), 'src/app/(dashboard)/patients/[id]/loading.tsx');
      const content = fs.readFileSync(loadingPath, 'utf8');
      
      expect(content).toContain('animate-pulse');
      expect(content).toContain('bg-gray-200');
      expect(content).toContain('bg-gray-100');
      expect(content).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    });

    it('should NOT be the generic loading text', () => {
      const loadingPath = path.resolve(process.cwd(), 'src/app/(dashboard)/patients/[id]/loading.tsx');
      const content = fs.readFileSync(loadingPath, 'utf8');
      
      expect(content).not.toContain('Đang tải danh sách bệnh nhân...');
    });
  });
});
