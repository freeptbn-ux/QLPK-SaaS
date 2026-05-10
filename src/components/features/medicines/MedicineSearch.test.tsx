import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MedicineSearch from './MedicineSearch';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('MedicineSearch Component', () => {
  const mockPush = vi.fn();
  const mockPathname = '/medicines';
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (usePathname as any).mockReturnValue(mockPathname);
    (useSearchParams as any).mockReturnValue(mockSearchParams);
  });

  it('should update local state when typing', () => {
    render(<MedicineSearch />);
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');
    
    fireEvent.change(input, { target: { value: 'Paracetamol' } });
    expect(input).toHaveValue('Paracetamol');
  });

  it('should call router.push with debounced value after 300ms', async () => {
    render(<MedicineSearch />);
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');
    
    fireEvent.change(input, { target: { value: 'Aspirin' } });
    
    // Should not call immediately
    expect(mockPush).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/medicines?search=Aspirin');
    }, { timeout: 500 });
  });

  it('should reset to page 1 when searching', async () => {
    const paramsWithPage = new URLSearchParams('page=2');
    (useSearchParams as any).mockReturnValue(paramsWithPage);
    
    render(<MedicineSearch />);
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');
    
    fireEvent.change(input, { target: { value: 'Aspirin' } });
    
    await waitFor(() => {
      const call = mockPush.mock.calls[0][0];
      expect(call).toContain('search=Aspirin');
      expect(call).not.toContain('page=2');
    }, { timeout: 500 });
  });
});
