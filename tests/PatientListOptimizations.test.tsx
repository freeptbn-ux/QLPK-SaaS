import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientListClient from '@/components/features/patients/PatientListClient';
import React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    toString: () => '',
    get: () => null,
  }),
}));

// Mock icons
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

// Mock dialogs and components
vi.mock('@/components/features/patients/PatientFormDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="patient-form-dialog" />,
}));

vi.mock('@/components/features/patients/MergePatientDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="merge-patient-dialog" />,
}));

vi.mock('@/components/ui/ConfirmDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="confirm-dialog" />,
}));

vi.mock('@/components/ui/EmptyState', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe('PatientListClient UI Optimizations - Phase 01: Remove Merge Button', () => {
  const mockInitialData = [
    { id: '1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
  ];

  it('should NOT render the "Dọn trùng" button in the patient list header', () => {
    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Verify that the "Dọn trùng" button is not present
    const mergeButton = screen.queryByRole('button', { name: /Dọn trùng/i });
    expect(mergeButton).toBeNull();
    
    // Also verify "Dọn trùng" text is not in the document
    expect(screen.queryByText('Dọn trùng')).toBeNull();
  });
});

describe('PatientListClient UI Optimizations - Phase 02: Clickable tel: Phone Links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render phone numbers as clickable tel: links in both desktop and mobile viewports', () => {
    const mockInitialData = [
      { id: 'patient-1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
    ];

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Get all links with the phone number
    const phoneLinks = screen.getAllByRole('link', { name: '0123456789' });
    expect(phoneLinks.length).toBe(2); // One for desktop, one for mobile

    phoneLinks.forEach((link) => {
      expect(link.getAttribute('href')).toBe('tel:0123456789');
    });
  });

  it('should prevent navigation to patient profile when phone number link is clicked', () => {
    const mockInitialData = [
      { id: 'patient-1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
    ];

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    const phoneLinks = screen.getAllByRole('link', { name: '0123456789' });
    const desktopPhoneLink = phoneLinks[0];

    // Click the phone link
    fireEvent.click(desktopPhoneLink);

    // The router push (parent row onClick) should not have been called
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should render italicized placeholder texts when phone number is missing and they must not be links', () => {
    const mockInitialData = [
      { id: 'patient-1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '', last_visit_date: null },
    ];

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // On Desktop, it should render "N/A"
    const desktopPlaceholder = screen.getByText('N/A');
    expect(desktopPlaceholder.tagName.toLowerCase()).toBe('span');
    expect(desktopPlaceholder.className).toContain('italic');

    // On Mobile, it should render "No phone"
    const mobilePlaceholder = screen.getByText('No phone');
    expect(mobilePlaceholder.tagName.toLowerCase()).toBe('span');
    expect(mobilePlaceholder.className).toContain('italic');

    // Verify no tel: links exist
    const telLinks = screen.queryAllByRole('link').filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('tel:');
    });
    expect(telLinks.length).toBe(0);
  });
});

describe('PatientListClient UI Optimizations - Phase 03: Enhance Row Hover Interactions', () => {
  it('should apply correct hover and transition CSS classes to desktop table row cells', () => {
    const mockInitialData = [
      { id: 'patient-1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
    ];

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // Get the name text link, then find its parent td element
    const nameLinks = screen.getAllByRole('link', { name: 'Nguyen Van A' });
    const nameCell = nameLinks[0].closest('td');
    
    expect(nameCell).not.toBeNull();
    expect(nameCell?.className).toContain('group-hover:border-primary-200');
    expect(nameCell?.className).toContain('dark:group-hover:border-primary-800/50');
    expect(nameCell?.className).toContain('group-hover:shadow-md');
  });

  it('should apply correct hover and transition CSS classes to mobile card container', () => {
    const mockInitialData = [
      { id: 'patient-1', name: 'Nguyen Van A', dob: '1990-01-01', phone: '0123456789', last_visit_date: null },
    ];

    render(
      <PatientListClient
        initialData={mockInitialData}
        totalCount={1}
        currentPage={1}
        currentSize={25}
        searchQuery=""
      />
    );

    // In the mobile view, we render a card. We can find the container by querying the phone link's ancestor card.
    const phoneLinks = screen.getAllByRole('link', { name: '0123456789' });
    const mobilePhoneLink = phoneLinks[1]; // Index 1 is the mobile one
    
    // Find the ancestor with className containing "card"
    let current: HTMLElement | null = mobilePhoneLink;
    let cardContainer: HTMLElement | null = null;
    while (current) {
      if (current.classList.contains('card')) {
        cardContainer = current;
        break;
      }
      current = current.parentElement;
    }

    expect(cardContainer).not.toBeNull();
    expect(cardContainer?.className).toContain('hover:border-primary-200');
    expect(cardContainer?.className).toContain('dark:hover:border-primary-800/50');
    expect(cardContainer?.className).toContain('hover:shadow-md');
  });
});

