import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 1: Feature Setup & Design Review Verification', () => {
  const formPath = path.resolve(__dirname, '../src/components/features/prescriptions/PrescriptionForm.tsx');
  const pkgPath = path.resolve(__dirname, '../package.json');

  it('should have PrescriptionForm.tsx in the correct location', () => {
    const exists = fs.existsSync(formPath);
    expect(exists).toBe(true);
  });

  it('should have "items" state defined inside PrescriptionForm.tsx', () => {
    const content = fs.readFileSync(formPath, 'utf-8');
    expect(content).toContain('const [items, setItems] = useState');
  });

  it('should have package.json with react-icons dependency', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(dependencies['react-icons']).toBeDefined();
  });
});
