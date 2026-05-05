import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LoadingProvider, useLoading } from '../LoadingProvider';

const TestComponent = () => {
  const { globalLoading, loadingText, startLoading, stopLoading } = useLoading();
  return (
    <div>
      <div data-testid="status">{globalLoading ? 'loading' : 'idle'}</div>
      <div data-testid="text">{loadingText}</div>
      <button onClick={() => startLoading('Processing...')}>Start</button>
      <button onClick={() => stopLoading()}>Stop</button>
    </div>
  );
};

describe('LoadingProvider', () => {
  it('initializes with default state', () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(screen.getByTestId('text').textContent).toBe('Đang tải');
  });

  it('updates state when startLoading is called', () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );
    
    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByTestId('status').textContent).toBe('loading');
    expect(screen.getByTestId('text').textContent).toBe('Processing...');
  });

  it('resets state when stopLoading is called', () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );
    
    act(() => {
      screen.getByText('Start').click();
    });
    
    act(() => {
      screen.getByText('Stop').click();
    });

    expect(screen.getByTestId('status').textContent).toBe('idle');
  });
});
