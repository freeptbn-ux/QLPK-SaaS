import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientListClient from '@/components/features/patients/PatientListClient';
import React from 'react';

// Create a mock for useTransition
const mockUseTransition = vi.fn();

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useTransition: () => mockUseTransition(),
  };
});

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    toString: () => mockSearchParams.toString(),
    get: (key: string) => mockSearchParams.get(key),
  }),
}));

// Mock icons to avoid rendering issues
vi.mock('react-icons/hi2', () => ({
  HiOutlinePencil: () => <div data-testid="icon-pencil" />,
  HiOutlineTrash: () => <div data-testid="icon-trash" />,
  HiOutlineEye: () => <div data-testid="icon-eye" />,
  HiOutlineChevronLeft: () => <div data-testid="icon-left" />,
  HiOutlineChevronRight: () => <div data-testid="icon-right" />,
  HiOutlinePlus: () => <div data-testid="icon-plus" />,
  HiOutlineEllipsisVertical: () => <div data-testid="icon-ellipsis" />,
  HiOutlineMagnifyingGlass: () => <div data-testid="icon-search" />,
  HiOutlineXMark: () => <div data-testid="icon-x" />,
  HiOutlineArrowPath: () => <div data-testid="icon-refresh" />,
}));

// Mock hooks and other components
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('./PatientFormDialog', () => ({ 
  __esModule: true,
  default: () => <div data-testid="patient-form-dialog" /> 
}));
vi.mock('./MergePatientDialog', () => ({ 
  __esModule: true,
  default: () => <div data-testid="merge-patient-dialog" /> 
}));
vi.mock('@/components/ui/ConfirmDialog', () => ({ 
  __esModule: true,
  default: () => <div data-testid="confirm-dialog" /> 
}));
vi.mock('@/components/ui/EmptyState', () => ({ 
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div> 
}));

describe('PatientListClient Loading UX (Phase 02)', () => {
  const mockInitialData = [
    { id: '1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('q');
    mockSearchParams.delete('page');
    mockSearchParams.delete('size');
  });

  it('should NOT apply opacity and pointer-events classes when isPending is false', () => {
    mockUseTransition.mockReturnValue([false, vi.fn()]);

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Locate the table container wrapper using its class or accessibility attributes
    const container = screen.getByRole('table').closest('div')?.parentElement;
    expect(container).toBeInTheDocument();
    
    // Check classes
    expect(container?.className).toContain('card');
    expect(container?.className).toContain('overflow-hidden');
    expect(container?.className).toContain('transition-opacity');
    expect(container?.className).toContain('duration-200');
    expect(container?.className).not.toContain('opacity-55');
    expect(container?.className).not.toContain('pointer-events-none');
    
    // Check aria-busy
    expect(container).toHaveAttribute('aria-busy', 'false');
  });

  it('should apply opacity-55 and pointer-events-none classes when isPending is true', () => {
    mockUseTransition.mockReturnValue([true, vi.fn()]);

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Locate the table container wrapper
    const container = screen.getByRole('table').closest('div')?.parentElement;
    expect(container).toBeInTheDocument();
    
    // Check classes
    expect(container?.className).toContain('card');
    expect(container?.className).toContain('overflow-hidden');
    expect(container?.className).toContain('transition-opacity');
    expect(container?.className).toContain('duration-200');
    expect(container?.className).toContain('opacity-55');
    expect(container?.className).toContain('pointer-events-none');
    
    // Check aria-busy
    expect(container).toHaveAttribute('aria-busy', 'true');
  });
});
