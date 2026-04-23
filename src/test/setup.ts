import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock MUI useTheme if needed or other global mocks
vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual('@mui/material/styles');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        mode: 'light',
        primary: { main: '#2563eb' },
        error: { main: '#ef4444' },
        text: { primary: '#000', secondary: '#666', disabled: '#999' },
      },
      shape: { borderRadius: 12 },
      transitions: {
        create: () => 'none',
      },
      typography: {
        fontFamily: 'Inter',
      },
    }),
  };
});
