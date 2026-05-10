import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import DoseCalculator from '../DoseCalculator';
import React from 'react';

// Mock getDrugPresets to ensure it's NOT called
vi.mock('@/actions/settings', () => ({
  getDrugPresets: vi.fn().mockRejectedValue(new Error('Should not be called')),
}));

describe('DoseCalculator Phase 03', () => {
  const mockPresets = [
    { name: 'Hạ sốt 100mg', mg: 100, ml: 5, dose: 10 },
    { name: 'Hạ sốt 250mg', mg: 250, ml: 5, dose: 10 }
  ];

  test('uses presets from props instead of fetching', async () => {
    render(
      <DoseCalculator 
        presets={mockPresets} 
        isEmbedded={false} 
      />
    );

    // Check if presets are in the select
    const select = screen.getByRole('combobox');
    expect(screen.getByText('Hạ sốt 100mg')).toBeInTheDocument();
    expect(screen.getByText('Hạ sốt 250mg')).toBeInTheDocument();
  });

  test('defaults to empty presets if none provided', () => {
    render(<DoseCalculator />);
    const select = screen.getByRole('combobox');
    expect(select.querySelectorAll('option').length).toBe(1); // Only "-- Tự nhập thông số --"
  });
});
