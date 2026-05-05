import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NavigationEvents from '../NavigationEvents';
import { useLoading } from '../LoadingProvider';

// Mock next/navigation
const mockUsePathname = vi.fn(() => '/');
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock LoadingProvider
vi.mock('../LoadingProvider', () => ({
  useLoading: vi.fn(),
}));

describe('NavigationEvents', () => {
  const mockSetIsNavigating = vi.fn();
  const mockSetLoadingText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
    (useLoading as any).mockReturnValue({
      setIsNavigating: mockSetIsNavigating,
      setLoadingText: mockSetLoadingText,
    });
  });

  it('renders without error and does not render UI', () => {
    const { container } = render(<NavigationEvents />);
    expect(container.firstChild).toBeNull();
  });

  it('calls setIsNavigating(true) when an internal link is clicked', async () => {
    render(<NavigationEvents />);
    
    const anchor = document.createElement('a');
    anchor.href = '/new-page';
    document.body.appendChild(anchor);
    
    fireEvent.click(anchor);
    
    expect(mockSetLoadingText).toHaveBeenCalledWith('Đang chuyển hướng...');
    expect(mockSetIsNavigating).toHaveBeenCalledWith(true);
    
    document.body.removeChild(anchor);
  });

  it('does not call setIsNavigating for external links', () => {
    render(<NavigationEvents />);
    
    const anchor = document.createElement('a');
    anchor.href = 'https://google.com';
    document.body.appendChild(anchor);
    
    fireEvent.click(anchor);
    
    expect(mockSetIsNavigating).not.toHaveBeenCalledWith(true);
    
    document.body.removeChild(anchor);
  });

  it('does not call setIsNavigating when Ctrl+Click is used', () => {
    render(<NavigationEvents />);
    
    const anchor = document.createElement('a');
    anchor.href = '/new-page';
    document.body.appendChild(anchor);
    
    fireEvent.click(anchor, { ctrlKey: true });
    
    expect(mockSetIsNavigating).not.toHaveBeenCalledWith(true);
    
    document.body.removeChild(anchor);
  });

  it('does not call setIsNavigating for hash changes on the same page', () => {
    render(<NavigationEvents />);
    
    const anchor = document.createElement('a');
    anchor.href = '/#section';
    document.body.appendChild(anchor);
    
    fireEvent.click(anchor);
    
    expect(mockSetIsNavigating).not.toHaveBeenCalledWith(true);
    
    document.body.removeChild(anchor);
  });

  it('calls setIsNavigating(false) when route changes', () => {
    const { rerender } = render(<NavigationEvents />);
    
    // Simulate route change by updating mock and rerendering
    mockUsePathname.mockReturnValue('/new-path');
    rerender(<NavigationEvents />);
    
    expect(mockSetIsNavigating).toHaveBeenCalledWith(false);
  });
});
