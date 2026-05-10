import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

// Mock ThemeContext if needed
vi.mock('@/theme/ThemeContext', () => ({
  useThemeContext: () => ({
    mode: 'light',
    toggleTheme: vi.fn(),
    mounted: true,
  }),
}));

// Add any other global mocks here
