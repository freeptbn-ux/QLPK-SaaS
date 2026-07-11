import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('PatientClickableRowCard', () => {
  const mockInitialData = [
    { id: 'patient-123', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clicking a table row triggers router.push to /patients/patient-123', () => {
    const { container } = render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Get the table row (tbody > tr)
    const tbody = container.querySelector('tbody');
    const row = tbody?.querySelector('tr');
    expect(row).toBeDefined();

    if (row) {
      fireEvent.click(row);
      expect(mockPush).toHaveBeenCalledWith('/patients/patient-123');
    }
  });

  it('clicking the Edit/Delete button on desktop triggers action/dialog but does NOT trigger router.push', () => {
    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Find the edit button by its title
    const editBtn = screen.getByTitle('Chỉnh sửa');
    fireEvent.click(editBtn);
    expect(mockPush).not.toHaveBeenCalled();

    // Find the delete button by its title
    const deleteBtn = screen.getByTitle('Xóa');
    fireEvent.click(deleteBtn);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clicking a mobile card triggers router.push to /patients/patient-123', () => {
    const { container } = render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Get the mobile card container.
    // The mobile container has class "md:hidden". Inside it, we have the patient card divs.
    const mobileContainer = container.querySelector('.md\\:hidden');
    const card = mobileContainer?.querySelector('.cursor-pointer');
    expect(card).toBeDefined();

    if (card) {
      fireEvent.click(card);
      expect(mockPush).toHaveBeenCalledWith('/patients/patient-123');
    }
  });

  it('clicking the Edit/Delete button on a mobile card does NOT trigger router.push', () => {
    const { container } = render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    const mobileContainer = container.querySelector('.md\\:hidden');
    if (!mobileContainer) throw new Error('Mobile container not found');

    // Inside mobileContainer, find the buttons
    const buttons = mobileContainer.querySelectorAll('button');
    // Button "Sửa" is buttons[0], Button "Xóa" is buttons[1]
    const editBtn = Array.from(buttons).find(btn => btn.textContent?.includes('Sửa'));
    const deleteBtn = Array.from(buttons).find(btn => btn.textContent?.includes('Xóa'));

    expect(editBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();

    if (editBtn) {
      fireEvent.click(editBtn);
      expect(mockPush).not.toHaveBeenCalled();
    }

    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      expect(mockPush).not.toHaveBeenCalled();
    }
  });
});
