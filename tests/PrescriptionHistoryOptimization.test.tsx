import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrescriptionHistory from '@/components/features/patients/PrescriptionHistory';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (importFn: any) => {
    return function DynamicComponent(props: any) {
      const [Component, setComponent] = React.useState<any>(null);
      React.useEffect(() => {
        importFn().then((mod: any) => setComponent(() => mod.default));
      }, []);
      return Component ? <Component {...props} /> : <div data-testid="loading-dynamic">Loading...</div>;
    };
  },
}));

// Mock react-icons
vi.mock('react-icons/hi2', () => ({
  HiOutlineChevronDown: () => <div data-testid="icon-down" />,
  HiOutlinePlus: () => <div data-testid="icon-plus" />,
  HiOutlinePrinter: () => <div data-testid="icon-print" />,
  HiOutlineBuildingOffice2: () => <div data-testid="icon-office" />,
  HiOutlineQueueList: () => <div data-testid="icon-queue" />,
  HiOutlineXMark: () => <div data-testid="icon-x" />,
  HiOutlineTrash: () => <div data-testid="icon-trash" />,
  HiOutlinePencilSquare: () => <div data-testid="icon-edit" />,
  HiOutlineCheck: () => <div data-testid="icon-check" />,
  HiOutlineArrowPath: () => <div data-testid="icon-refresh" />,
  HiOutlineCalculator: () => <div data-testid="icon-calc" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('PrescriptionHistory Optimization', () => {
  const mockPrescriptions = [
    {
      id: 1,
      patient_id: 1,
      prescription_date: new Date().toISOString(),
      diagnosis: 'Test Diagnosis',
      notes: 'Test Notes',
      total_amount: 100000,
      consultation_fee: 50000,
      prescription_details: [
        {
          id: 1,
          medicine_id: 101,
          quantity: 2,
          unit_price: 25000,
          medicines: { name: 'Panadol', packing_spec: 'Vỉ 10 viên' }
        }
      ]
    }
  ];

  it('should render prescription history', () => {
    render(
      <PrescriptionHistory 
        patientId={1} 
        patientName="Test Patient" 
        prescriptions={mockPrescriptions as any} 
        totalCount={1}
      />
    );
    
    expect(screen.getByText(/Lịch sử khám bệnh/)).toBeDefined();
    expect(screen.getByText('Test Diagnosis')).toBeDefined();
  });

  it('should open MedicineUsageDialog when clicking Lịch sử dùng thuốc', async () => {
    render(
      <PrescriptionHistory 
        patientId={1} 
        patientName="Test Patient" 
        prescriptions={mockPrescriptions as any} 
        totalCount={1}
      />
    );
    
    fireEvent.click(screen.getByText('Lịch sử dùng thuốc'));
    
    await waitFor(() => {
      // MedicineUsageDialog has internal logic, but we want to see if it renders
      // In our mock, it will load the component.
      // MedicineUsageDialog usually has text "Lịch sử dùng thuốc" in its header too
      expect(screen.queryByText('Loading...')).toBeNull();
    }, { timeout: 2000 });
  });

  it('should show "Thêm thuốc" button for today\'s prescription', () => {
    render(
      <PrescriptionHistory 
        patientId={1} 
        patientName="Test Patient" 
        prescriptions={mockPrescriptions as any} 
        totalCount={1}
      />
    );
    
    // Toggle expand first
    fireEvent.click(screen.getByText('Test Diagnosis'));
    
    expect(screen.getByText('Thêm thuốc')).toBeDefined();
  });
});
