import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Loading from '../Loading';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('Loading Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders spinner when isLoading is true after delay', async () => {
    render(<Loading isLoading={true} delay={100} />);
    
    // Initially not showing due to delay
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    
    // Advance timers by 100ms
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader.className).toContain('spinner');
  });

  it('renders skeleton variant (pulse) correctly', async () => {
    render(<Loading isLoading={true} variant="skeleton" delay={0} />);
    
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    const loader = screen.getByRole('status');
    expect(loader.className).toContain('animate-pulse');
  });

  it('renders shimmer variant correctly', async () => {
    render(<Loading isLoading={true} variant="shimmer" delay={0} />);
    
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    const loader = screen.getByRole('status');
    expect(loader.className).toContain('shimmer');
  });

  it('renders bar variant correctly', async () => {
    render(<Loading isLoading={true} variant="bar" delay={0} />);
    
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    const loader = screen.getByRole('status');
    expect(loader.className).toContain('bar');
  });

  it('renders children when not loading', async () => {
    render(
      <Loading isLoading={false}>
        <div data-testid="child">Loaded Content</div>
      </Loading>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('respects minDuration when loading state changes quickly', async () => {
    const { rerender } = render(<Loading isLoading={true} delay={0} minDuration={1000} />);
    
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Change isLoading to false immediately
    rerender(<Loading isLoading={false} delay={0} minDuration={1000} />);
    
    // Should still be visible because of minDuration
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Advance half of minDuration
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Advance rest of minDuration
    await act(async () => {
      vi.advanceTimersByTime(501);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('logs a warning when loading persists for > 2000ms', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<Loading isLoading={true} delay={0} />);
    
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[ui.loading.long]'));
    warnSpy.mockRestore();
  });
});
