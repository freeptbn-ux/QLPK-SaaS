import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Next.js Config Optimization', () => {
  it('should have compress: true in next.config.ts', () => {
    const configPath = path.resolve(process.cwd(), 'next.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    expect(content).toContain('compress: true');
  });

  it('should have optimizePackageImports in next.config.ts', () => {
    const configPath = path.resolve(process.cwd(), 'next.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    expect(content).toContain('optimizePackageImports');
    expect(content).toContain('lucide-react');
    expect(content).toContain('recharts');
    expect(content).toContain('dayjs');
    expect(content).toContain('react-icons/hi2');
  });
});
