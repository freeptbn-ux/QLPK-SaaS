import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import PatientSearch from '@/components/features/patients/PatientSearch';

// Mock icons
vi.mock('react-icons/hi2', () => ({
  HiOutlineMagnifyingGlass: () => <div data-testid="icon-search" />,
  HiOutlineXMark: () => <div data-testid="icon-x" />,
  HiOutlineArrowPath: () => <div data-testid="icon-refresh" />,
}));

describe('PatientSearch Component (Category A)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A1: Render với initialValue
  it('A1: renders with initial value', () => {
    const onSearch = vi.fn();
    render(<PatientSearch onSearch={onSearch} initialValue="Tuấn" />);
    expect(screen.getByRole('textbox')).toHaveValue('Tuấn');
  });

  // A2: Gõ chữ → debounce → gọi onSearch
  it('A2: calls onSearch after debounce when user types', () => {
    const onSearch = vi.fn();
    render(<PatientSearch onSearch={onSearch} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Tuấn' } });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(onSearch).toHaveBeenCalledWith('Tuấn');
  });

  // A3: URL sync không ghi đè khi user đang gõ
  it('A3: does NOT overwrite input when initialValue changes but matches last searched/debounced term', () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <PatientSearch onSearch={onSearch} initialValue="" />
    );
    const input = screen.getByRole('textbox');

    // User types "Tuấn"
    fireEvent.change(input, { target: { value: 'Tuấn' } });

    // Wait for debounce to trigger onSearch
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledWith('Tuấn');

    // Simulate parent rerendering with initialValue = "Tuấn" after search resolves
    // Before/during this, user quickly types "Tu"
    fireEvent.change(input, { target: { value: 'Tu' } });
    
    // Parent rerenders with initialValue = "Tuấn"
    rerender(<PatientSearch onSearch={onSearch} initialValue="Tuấn" />);
    
    // Input must remain "Tu" and NOT reset back to "Tuấn" (avoiding Input Jump)
    expect(input).toHaveValue('Tu');

    // Debounce the new change "Tu"
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledWith('Tu');
  });

  // A4: Back button sync
  it('A4: syncs input when initialValue changes externally (back button)', () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <PatientSearch onSearch={onSearch} initialValue="Tuấn" />
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Tuấn');

    // Simulate back button: initialValue changes to ""
    rerender(<PatientSearch onSearch={onSearch} initialValue="" />);
    
    expect(input).toHaveValue('');
  });

  // A5: Nút clear "✕" hoạt động
  it('A5: clearing input triggers onSearch with empty string', () => {
    const onSearch = vi.fn();
    render(<PatientSearch onSearch={onSearch} initialValue="Tuấn" />);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    onSearch.mockClear();

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith('');
  });

  // A6: onSearch ref thay đổi không trigger search
  it('A6: changing onSearch prop does not trigger search', () => {
    const onSearch1 = vi.fn();
    const onSearch2 = vi.fn();
    const { rerender } = render(
      <PatientSearch onSearch={onSearch1} initialValue="Tuấn" />
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Change onSearch prop without changing search terms
    rerender(<PatientSearch onSearch={onSearch2} initialValue="Tuấn" />);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Neither onSearch1 nor onSearch2 should be called due to prop change
    expect(onSearch1).not.toHaveBeenCalled();
    expect(onSearch2).not.toHaveBeenCalled();
  });

  // A7: Mount lần đầu không gọi onSearch thừa
  it('A7: does NOT call onSearch on initial mount when values match', () => {
    const onSearch = vi.fn();
    render(<PatientSearch onSearch={onSearch} initialValue="Tuấn" />);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // onSearch should NOT be called because initialValue === lastSearchedTerm
    expect(onSearch).not.toHaveBeenCalled();
  });
});
