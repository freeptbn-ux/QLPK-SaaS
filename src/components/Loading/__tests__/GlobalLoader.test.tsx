import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LoadingProvider, useLoading } from '../LoadingProvider';
import { GlobalLoader } from '../GlobalLoader';

// Mock framer-motion to avoid issues with AnimatePresence in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const Controller = () => {
  const { startLoading, stopLoading } = useLoading();
  return (
    <div>
      <button onClick={() => startLoading('Custom Text')}>Start</button>
      <button onClick={() => stopLoading()}>Stop</button>
    </div>
  );
};

describe('GlobalLoader', () => {
  it('does not render by default', () => {
    render(
      <LoadingProvider>
        <GlobalLoader />
      </LoadingProvider>
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders when globalLoading is true', () => {
    render(
      <LoadingProvider>
        <GlobalLoader />
        <Controller />
      </LoadingProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('hides when globalLoading becomes false', () => {
    render(
      <LoadingProvider>
        <GlobalLoader />
        <Controller />
      </LoadingProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      screen.getByText('Stop').click();
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
