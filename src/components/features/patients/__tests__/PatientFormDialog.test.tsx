import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientFormDialog from '../PatientFormDialog';
import { useToast } from '@/hooks/useToast';
import { addPatient, updatePatient } from '@/actions/patients';

// Mock dependencies
vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

vi.mock('@/actions/patients', () => ({
  addPatient: vi.fn(),
  updatePatient: vi.fn(),
}));

// Mock MUI icons to avoid issues
vi.mock('@mui/icons-material', () => ({
  InfoOutlined: () => <div data-testid="info-icon" />,
}));

describe('PatientFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly in "Add" mode', () => {
    render(
      <PatientFormDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Thêm bệnh nhân mới')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên *')).toBeInTheDocument();
    // DateInput labels
    expect(screen.getByPlaceholderText('DD')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('YYYY')).toBeInTheDocument();
  });

  it('should display warning for old dob format when editing', () => {
    const oldPatient = {
      id: '1',
      name: 'Nguyen Van A',
      dob: '1990', // Old format
      gender: 'Nam',
      address: '',
      phone: '',
      weight: '',
      diagnosis: '',
      created_at: '',
      name_normalized: '',
    };

    render(
      <PatientFormDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        patient={oldPatient as any}
      />
    );

    expect(screen.getByText(/Format cũ: "1990". Vui lòng nhập lại./)).toBeInTheDocument();
    
    // DateInput should be empty
    const dayInput = screen.getByPlaceholderText('DD') as HTMLInputElement;
    expect(dayInput.value).toBe('');
  });

  it('should NOT display warning for correct dob format when editing', () => {
    const modernPatient = {
      id: '2',
      name: 'Nguyen Van B',
      dob: '15/06/1990',
      gender: 'Nam',
      address: '',
      phone: '',
      weight: '',
      diagnosis: '',
      created_at: '',
      name_normalized: '',
    };

    render(
      <PatientFormDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        patient={modernPatient as any}
      />
    );

    expect(screen.queryByText(/Format cũ:/)).not.toBeInTheDocument();
    
    // DateInput should be filled
    expect((screen.getByPlaceholderText('DD') as HTMLInputElement).value).toBe('15');
    expect((screen.getByPlaceholderText('MM') as HTMLInputElement).value).toBe('06');
    expect((screen.getByPlaceholderText('YYYY') as HTMLInputElement).value).toBe('1990');
  });

  it('should show validation error for invalid date', async () => {
    render(
      <PatientFormDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText('Họ và tên *');
    fireEvent.change(nameInput, { target: { value: 'Test Patient' } });

    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');

    fireEvent.change(dayInput, { target: { value: '32' } });
    fireEvent.change(monthInput, { target: { value: '13' } });
    fireEvent.change(yearInput, { target: { value: '2025' } });

    const saveButton = screen.getByText('Lưu');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Ngày sinh không hợp lệ (DD/MM/YYYY)')).toBeInTheDocument();
    });
  });
});
