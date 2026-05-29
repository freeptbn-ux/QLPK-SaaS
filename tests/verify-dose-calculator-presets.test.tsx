import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import DoseCalculatorPage from '../src/app/(dashboard)/dose-calculator/page';
import { getDrugPresets } from '../src/actions/settings';
import React from 'react';

// Mock dependencies
vi.mock('@/actions/settings', () => ({
  getAllSettings: vi.fn().mockResolvedValue({ clinic_name: 'Phòng Khám Test' }),
  getDrugPresets: vi.fn(),
}));

vi.mock('@/components/ui/PageHeader', () => ({
  default: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@/components/features/dose-calculator/DoseCalculator', () => ({
  default: ({ presets }: any) => (
    <div data-testid="dose-calculator">
      <span>Presets count: {presets ? presets.length : 0}</span>
      {presets && presets.map((p: any) => (
        <span key={p.name} data-testid="preset-item">{p.name}</span>
      ))}
    </div>
  ),
}));

vi.mock('@/components/features/dose-calculator/DrugPresetManager', () => ({
  default: () => (
    <div data-testid="drug-preset-manager">
      Drug Preset Manager
    </div>
  ),
}));

describe('DoseCalculatorPage Phase 01 Loading Presets Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('DoseCalculatorPage component is async and successfully loads and passes presets', async () => {
    const mockPresets = [
      { name: 'Hapacol 150mg/5ml', mg: 150, ml: 5, dose: 10 },
      { name: 'Ibuprofen 100mg/5ml', mg: 100, ml: 5, dose: 5 }
    ];
    (getDrugPresets as any).mockResolvedValue(mockPresets);

    // Call the async Server Component function directly to get the resolved JSX
    const pageElement = await DoseCalculatorPage();

    render(pageElement);

    // Verify PageHeader rendered
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Tính liều thuốc nhi khoa')).toBeInTheDocument();

    // Verify DoseCalculator rendered with passed presets
    expect(screen.getByTestId('dose-calculator')).toBeInTheDocument();
    expect(screen.getByText('Presets count: 2')).toBeInTheDocument();
    expect(screen.getByText('Hapacol 150mg/5ml')).toBeInTheDocument();
    expect(screen.getByText('Ibuprofen 100mg/5ml')).toBeInTheDocument();

    // Verify DrugPresetManager rendered
    expect(screen.getByTestId('drug-preset-manager')).toBeInTheDocument();

    expect(getDrugPresets).toHaveBeenCalledTimes(1);
  });

  test('DoseCalculatorPage handles empty presets gracefully', async () => {
    (getDrugPresets as any).mockResolvedValue([]);

    const pageElement = await DoseCalculatorPage();
    render(pageElement);

    expect(screen.getByTestId('dose-calculator')).toBeInTheDocument();
    expect(screen.getByText('Presets count: 0')).toBeInTheDocument();
  });
});
