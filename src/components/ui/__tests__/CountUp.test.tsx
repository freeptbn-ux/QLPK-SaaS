import { render, screen, act } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CountUp from '../CountUp';
import React from 'react';

// Mock animate from framer-motion to control time
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    animate: (value: any, target: number, options: any) => {
      if (options?.onUpdate) options.onUpdate(target);
      if (value?.set) value.set(target);
      return { stop: () => {} };
    },
  };
});

test('CountUp renders formatted value', () => {
  render(<CountUp value={100000} />);
  expect(screen.getByText('100.000 đ')).toBeInTheDocument();
});

test('CountUp updates when value changes', async () => {
  const { rerender } = render(<CountUp value={100000} />);
  expect(screen.getByText('100.000 đ')).toBeInTheDocument();

  await act(async () => {
    rerender(<CountUp value={200000} />);
  });

  expect(screen.getByText('200.000 đ')).toBeInTheDocument();
});
