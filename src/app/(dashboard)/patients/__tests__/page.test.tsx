import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientsPage from '../page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as patientsActions from '@/actions/patients';

// Mock the actions
vi.mock('@/actions/patients', () => ({
  getPatientsPaginated: vi.fn(),
  searchPatients: vi.fn(),
}));

// Mock the components
vi.mock('@/components/ui/PageHeader', () => ({
  default: ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@/components/features/patients/PatientListClient', () => ({
  default: () => <div data-testid="patient-list-client" />,
}));

vi.mock('@/components/Loading', () => ({
  BallLoader: () => <div data-testid="ball-loader" />,
}));

describe('PatientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (patientsActions.getPatientsPaginated as any).mockResolvedValue({ data: [], count: 0 });
    (patientsActions.searchPatients as any).mockResolvedValue({ data: [], count: 0 });
  });

  it('renders the page header and a suspense boundary', async () => {
    const searchParams = Promise.resolve({ q: '', page: '1', size: '50' });
    
    // In Next.js 15, we await the component if it's an async component in tests
    const Page = await PatientsPage({ searchParams });
    render(Page);

    // Verify header is present
    expect(screen.getByTestId('page-header')).toBeDefined();
    expect(screen.getByText('Bệnh nhân')).toBeDefined();
    expect(screen.getByText('Quản lý danh sách hồ sơ và lịch sử khám của bệnh nhân')).toBeDefined();
  });

  it('calls getPatientsPaginated when no query is provided', async () => {
    const searchParams = Promise.resolve({});
    const Page = await PatientsPage({ searchParams });
    render(Page);

    // The wrapper is rendered inside Suspense. In a test environment, 
    // it might resolve immediately if the promise is already resolved.
    expect(patientsActions.getPatientsPaginated).toHaveBeenCalledWith(1, 50);
  });

  it('calls searchPatients when a query is provided', async () => {
    const searchParams = Promise.resolve({ q: 'test-query' });
    const Page = await PatientsPage({ searchParams });
    render(Page);

    expect(patientsActions.searchPatients).toHaveBeenCalledWith('test-query', 1, 50);
  });
});
