import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientList from '../PatientList';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/actions/patients', () => ({
  getPatientsPaginated: vi.fn(() => Promise.resolve({ data: [
    { id: 'patient-1', name: 'Nguyen Van A', dob: '01/01/1990', gender: 'Nam', phone: '0123456789', address: 'Hanoi', diagnosis: 'Cam cúm' }
  ], count: 1 })),
  searchPatients: vi.fn(),
  deletePatient: vi.fn(),
}));

vi.mock('../PatientSearch', () => ({
  default: () => <div data-testid="patient-search" />,
}));

vi.mock('../PatientFormDialog', () => ({
  default: () => <div data-testid="patient-form-dialog" />,
}));

vi.mock('../MergePatientDialog', () => ({
  default: () => <div data-testid="merge-patient-dialog" />,
}));

vi.mock('@/components/ui/ConfirmDialog', () => ({
  default: () => <div data-testid="confirm-dialog" />,
}));

vi.mock('@/components/ui/EmptyState', () => ({
  default: () => <div data-testid="empty-state" />,
}));

vi.mock('@/components/Loading', () => ({
  LoadingReporter: () => <div data-testid="loading-reporter" />,
  BallLoader: () => <div data-testid="ball-loader" />,
}));

describe('PatientList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render patient name as a link to details page', async () => {
    render(<PatientList />);

    // Wait for data to load (it's in useEffect)
    // There are 2 links: one for desktop table and one for mobile cards
    const patientLinks = await screen.findAllByRole('link', { name: /Nguyen Van A/i });
    
    expect(patientLinks.length).toBeGreaterThan(0);
    expect(patientLinks[0]).toHaveAttribute('href', '/patients/patient-1');
    expect(patientLinks[0]).toHaveClass('hover:text-primary-600');
  });
});
