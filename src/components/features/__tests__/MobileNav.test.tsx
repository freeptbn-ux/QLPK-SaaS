import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MobileNav from '../MobileNav';
import { usePathname } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('MobileNav', () => {
  it('renders correctly on non-prescribe pages', () => {
    (usePathname as any).mockReturnValue('/patients');
    const { container } = render(<MobileNav />);
    
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.className).toContain('fixed bottom-0');
  });

  it('returns null on prescribe pages', () => {
    (usePathname as any).mockReturnValue('/patients/123/prescribe');
    const { container } = render(<MobileNav />);
    
    const nav = container.querySelector('nav');
    expect(nav).toBeNull();
  });

  it('renders correctly on other pages like medicines', () => {
    (usePathname as any).mockReturnValue('/medicines');
    const { container } = render(<MobileNav />);
    
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
  });
});
