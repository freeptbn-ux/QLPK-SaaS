import React from 'react';
import { render, screen } from '@testing-library/react';
import { BallLoader } from '../BallLoader';

describe('BallLoader', () => {
  it('renders with default props', () => {
    render(<BallLoader />);
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<BallLoader text="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<BallLoader size="sm" />);
    // Check if className contains 'sm'
    expect(screen.getByRole('status').className).toContain('sm');

    rerender(<BallLoader size="lg" />);
    expect(screen.getByRole('status').className).toContain('lg');
  });

  it('renders as overlay', () => {
    render(<BallLoader isOverlay />);
    expect(screen.getByRole('status').className).toContain('overlay');
  });
  
  it('has 4 balls', () => {
    const { container } = render(<BallLoader />);
    // The first div inside the status role should be the ballWrapper
    const status = screen.getByRole('status');
    const ballWrapper = status.firstChild;
    // It should have 4 children (the balls)
    expect(ballWrapper?.childNodes.length).toBe(4);
  });
});
