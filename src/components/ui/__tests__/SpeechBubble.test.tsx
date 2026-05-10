import { render, screen, fireEvent } from '@testing-library/react';
import { SpeechBubble } from '../SpeechBubble';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock useMediaQuery
vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn().mockReturnValue(false),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SpeechBubble', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render content when open', () => {
    render(
      <SpeechBubble isOpen={true} onClose={onClose} title="Test Title">
        Bubble Content
      </SpeechBubble>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Bubble Content')).toBeInTheDocument();
  });

  it('should show skeleton loading state', () => {
    render(
      <SpeechBubble isOpen={true} onClose={onClose} loading={true}>
        Content
      </SpeechBubble>
    );
    // The skeleton container has animate-pulse class
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should show error state and retry button', () => {
    const onRetry = vi.fn();
    render(
      <SpeechBubble isOpen={true} onClose={onClose} error={true} onRetry={onRetry}>
        Content
      </SpeechBubble>
    );
    expect(screen.getByText(/Không tìm thấy thông tin/)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /thử lại/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <SpeechBubble isOpen={true} onClose={onClose}>
        Content
      </SpeechBubble>
    );
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
