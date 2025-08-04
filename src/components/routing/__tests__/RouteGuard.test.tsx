import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RouteGuard from '../RouteGuard';

// Mock the useHealth hook
import { vi } from 'vitest';

const mockUseHealth = vi.fn();
vi.mock('../../../hooks/useHealth', () => ({
  useHealth: mockUseHealth
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('RouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when no health check is required', () => {
    mockUseHealth.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });

    render(
      <TestWrapper>
        <RouteGuard requiresHealthy={false}>
          <div>Test Content</div>
        </RouteGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows loading state when health check is required and loading', () => {
    mockUseHealth.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    render(
      <TestWrapper>
        <RouteGuard requiresHealthy={true}>
          <div>Test Content</div>
        </RouteGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Checking system status...')).toBeInTheDocument();
  });

  it('renders children when health check passes', () => {
    mockUseHealth.mockReturnValue({
      data: { status: 'healthy' },
      isLoading: false,
      error: null
    });

    render(
      <TestWrapper>
        <RouteGuard requiresHealthy={true}>
          <div>Test Content</div>
        </RouteGuard>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});