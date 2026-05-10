import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientListClient from '../PatientListClient';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

// Mock useTransition to control isPending
const mockStartTransition = vi.fn((cb) => cb());
let mockIsPending = false;
vi.mock('react', async () => {
  const actual = await vi.importActual('react') as any;
  return {
    ...actual,
    useTransition: () => [mockIsPending, mockStartTransition],
  };
});

// Mock components
vi.mock('../PatientSearch', () => ({
  default: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="patient-search" data-is-loading={isLoading} />
  ),
}));

vi.mock('../PatientFormDialog', () => ({ default: () => null }));
vi.mock('../MergePatientDialog', () => ({ default: () => null }));
vi.mock('@/components/ui/ConfirmDialog', () => ({ default: () => null }));
vi.mock('@/components/ui/EmptyState', () => ({ default: () => null }));

describe('PatientListClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  const defaultProps = {
    initialData: [],
    totalCount: 0,
    currentPage: 1,
    currentSize: 25,
    searchQuery: '',
  };

  it('should pass isLoading=false to PatientSearch initially', () => {
    mockIsPending = false;
    render(<PatientListClient {...defaultProps} />);
    const search = screen.getByTestId('patient-search');
    expect(search.getAttribute('data-is-loading')).toBe('false');
  });

  it('should pass isLoading=true to PatientSearch when isPending is true', () => {
    mockIsPending = true;
    render(<PatientListClient {...defaultProps} />);
    const search = screen.getByTestId('patient-search');
    expect(search.getAttribute('data-is-loading')).toBe('true');
  });
});
