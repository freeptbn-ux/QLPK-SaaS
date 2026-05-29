import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Pagination from './Pagination';
import { usePathname, useSearchParams } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('Pagination Component', () => {
  const mockPathname = '/medicines';
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as any).mockReturnValue(mockPathname);
    (useSearchParams as any).mockReturnValue(mockSearchParams);
  });

  it('should not render when total pages is 1', () => {
    render(<Pagination currentPage={1} totalCount={10} limit={20} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('should render correct number of pages', () => {
    render(<Pagination currentPage={1} totalCount={50} limit={10} />); // 5 pages
    
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('should highlight current page', () => {
    render(<Pagination currentPage={3} totalCount={50} limit={10} />);
    const activePages = screen.getAllByText('3');
    const activePage = activePages.find(el => el.className.includes('bg-primary-600'));
    expect(activePage).toBeDefined();
  });

  it('should generate correct URLs with existing params', () => {
    const existingParams = new URLSearchParams('search=test');
    (useSearchParams as any).mockReturnValue(existingParams);
    
    render(<Pagination currentPage={1} totalCount={50} limit={10} />);
    const page2Links = screen.getAllByText('2');
    const page2Link = page2Links.find(el => (el as HTMLAnchorElement).href) as HTMLAnchorElement;
    expect(page2Link.href).toContain('search=test');
    expect(page2Link.href).toContain('page=2');
  });
});
