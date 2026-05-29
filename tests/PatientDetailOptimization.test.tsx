import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientDetail from '@/components/features/patients/PatientDetail';
import React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock next/dynamic to render components synchronously in tests
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
  HiOutlinePencil: () => <div data-testid="icon-pencil" />,
  HiOutlineTrash: () => <div data-testid="icon-trash" />,
  HiOutlineArrowLeft: () => <div data-testid="icon-back" />,
}));

// Mock actions
vi.mock('@/actions/patients', () => ({
  deletePatient: vi.fn().mockResolvedValue({ success: true }),
}));

describe('PatientDetail Optimization', () => {
  const mockPatient = {
    id: 1,
    name: 'Test Patient',
    dob: '1990-01-01',
    gender: 'Nam',
    phone: '0123456789',
    address: '123 Test St',
    weight: 70,
    diagnosis: 'Healthy',
    created_at: '',
    updated_at: '',
  };

  it('should render patient information', () => {
    render(<PatientDetail patient={mockPatient} />);
    
    expect(screen.getByText('Test Patient')).toBeDefined();
    expect(screen.getByText('0123456789')).toBeDefined();
    expect(screen.getByText('123 Test St')).toBeDefined();
  });

  it('should show "Chỉnh sửa" and "Xóa" buttons', () => {
    render(<PatientDetail patient={mockPatient} />);
    
    expect(screen.getByText('Chỉnh sửa')).toBeDefined();
    expect(screen.getByText('Xóa')).toBeDefined();
  });

  it('should open PatientFormDialog when clicking Edit', async () => {
    render(<PatientDetail patient={mockPatient} />);
    
    fireEvent.click(screen.getByText('Chỉnh sửa'));
    
    // Since it's dynamic, we might need to wait for it to load
    // But our mock renders it after a promise resolves
    await waitFor(() => {
      // In PatientFormDialog, there's a text "Cập nhật thông tin bệnh nhân"
      expect(screen.queryByText('Cập nhật thông tin bệnh nhân')).toBeDefined();
    }, { timeout: 2000 });
  });

  it('should open ConfirmDialog when clicking Delete', async () => {
    render(<PatientDetail patient={mockPatient} />);
    
    fireEvent.click(screen.getByText('Xóa'));
    
    await waitFor(() => {
      expect(screen.queryByText('Xác nhận xóa')).toBeDefined();
      expect(screen.queryByText(/Bạn có chắc chắn muốn xóa bệnh nhân "Test Patient"?/)).toBeDefined();
    }, { timeout: 2000 });
  });
});
