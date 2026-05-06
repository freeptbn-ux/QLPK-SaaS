import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearch from '../PatientSearch';
import { describe, it, expect, vi } from 'vitest';

// Mock hi2 icons
vi.mock('react-icons/hi2', () => ({
  HiOutlineMagnifyingGlass: () => <div data-testid="magnifying-glass" />,
  HiOutlineXMark: () => <div data-testid="x-mark" />,
  HiOutlineArrowPath: ({ className }: { className?: string }) => <div data-testid="arrow-path" className={className} />,
}));

describe('PatientSearch', () => {
  const mockOnSearch = vi.fn();

  it('should render magnifying glass when isLoading is false', () => {
    render(<PatientSearch onSearch={mockOnSearch} isLoading={false} />);
    expect(screen.getByTestId('magnifying-glass')).toBeDefined();
    expect(screen.queryByTestId('arrow-path')).toBeNull();
  });

  it('should render arrow path spinner when isLoading is true', () => {
    render(<PatientSearch onSearch={mockOnSearch} isLoading={true} />);
    expect(screen.queryByTestId('magnifying-glass')).toBeNull();
    const spinner = screen.getByTestId('arrow-path');
    expect(spinner).toBeDefined();
    expect(spinner.className).toContain('animate-spin');
  });

  it('should render initial value in input', () => {
    render(<PatientSearch onSearch={mockOnSearch} initialValue="Test Patient" />);
    const input = screen.getByPlaceholderText(/Tìm theo tên/i) as HTMLInputElement;
    expect(input.value).toBe('Test Patient');
  });
});
