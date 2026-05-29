import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopBar from '../TopBar';
import Sidebar from '../Sidebar';

// Mock context and hooks
vi.mock('@/theme/ThemeContext', () => ({
  useThemeContext: () => ({ mode: 'light', toggleTheme: vi.fn(), mounted: true })
}));
vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn()
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/patients'
}));

describe('Navigation Components', () => {
  describe('TopBar', () => {
    it('renders with white background and shadow-sm', () => {
      const { container } = render(<TopBar />);
      const header = container.querySelector('header');
      expect(header?.className).toContain('bg-white');
      expect(header?.className).toContain('shadow-sm');
    });
  });

  describe('Sidebar', () => {
    it('renders SidebarContent with white background and shadow-sm', () => {
      const { container } = render(<Sidebar open={true} onClose={() => {}} />);
      // We check for the background class in the SidebarContent div
      const sidebarDiv = container.querySelector('.bg-white');
      expect(sidebarDiv).toBeTruthy();
      expect(sidebarDiv?.className).toContain('shadow-sm');
    });
  });
});
