import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '../EmptyState';
import { HiOutlineHandThumbUp } from 'react-icons/hi2';

describe('EmptyState Component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState 
        title="Test Title" 
        description="Test Description" 
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const { container } = render(
      <EmptyState 
        title="Test" 
        icon={HiOutlineHandThumbUp} 
      />
    );
    
    // Check if the icon is rendered (it's an SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState 
        title="Test" 
        action={<button>Click Me</button>} 
      />
    );
    
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
