import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardLayout from '../layout';

// Mock components used in DashboardLayout
vi.mock('@/components/features/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));
vi.mock('@/components/features/TopBar', () => ({
  default: () => <div data-testid="topbar">TopBar</div>
}));
vi.mock('@/components/features/MobileNav', () => ({
  default: () => <div data-testid="mobilenav">MobileNav</div>
}));

describe('DashboardLayout', () => {
  it('renders with slate-50 background', () => {
    const { container } = render(
      <DashboardLayout>
        <div data-testid="children">Content</div>
      </DashboardLayout>
    );
    
    const wrapper = container.querySelector('.bg-slate-50');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.className).toContain('bg-slate-50');
  });

  it('renders main content area with correct padding classes', () => {
    const { container } = render(
      <DashboardLayout>
        <div data-testid="children">Content</div>
      </DashboardLayout>
    );
    
    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    // px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-24 md:ml-60
    expect(main?.className).toContain('px-4');
    expect(main?.className).toContain('md:px-6');
    expect(main?.className).toContain('md:ml-60');
  });
});
