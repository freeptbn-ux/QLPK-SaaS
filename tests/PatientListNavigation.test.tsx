import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientListClient from '@/components/features/patients/PatientListClient';
import React from 'react';

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

describe('PatientListClient Navigation Refactor', () => {
  const mockInitialData = [
    { id: '1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('q');
    mockSearchParams.delete('page');
    mockSearchParams.delete('size');
  });

  it('should use router.replace and scroll: false when searching', async () => {
    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên hoặc số điện thoại/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('q=test'),
        expect.objectContaining({ scroll: false })
      );
    }, { timeout: 1000 });
  });

  it('should use router.replace and scroll: false when changing page', () => {
    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={100}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    const nextButton = screen.getByTestId('icon-right').parentElement;
    if (!nextButton) throw new Error('Next button not found');
    
    fireEvent.click(nextButton);

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.objectContaining({ scroll: false })
    );
  });

  it('should use router.push and scroll: false when changing rows per page', () => {
    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={100}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '50' } });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('size=50'),
      expect.objectContaining({ scroll: false })
    );
  });
});
