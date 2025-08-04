import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import HealthIndicator from '../HealthIndicator';
import * as hooks from '../../hooks';

// Mock the hooks
vi.mock('../../hooks', () => ({
  useHealthStatus: vi.fn(),
  useHealthMetrics: vi.fn(),
}));

// Mock the accessibility utils
vi.mock('../../utils/accessibility', () => ({
  createStatusAria: vi.fn(() => ({ 'aria-label': 'Health status' })),
}));

describe('HealthIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders healthy status correctly', () => {
    (hooks.useHealthStatus as any).mockReturnValue({
      status: 'healthy',
      isHealthy: true,
      isDegraded: false,
      isLoading: false,
      error: null,
      canCreateJobs: true,
    });

    (hooks.useHealthMetrics as any).mockReturnValue({
      uptime: 3600,
      responseTime: 150,
      version: '1.0.0',
    });

    render(<HealthIndicator />);

    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    (hooks.useHealthStatus as any).mockReturnValue({
      status: 'unknown',
      isHealthy: false,
      isDegraded: false,
      isLoading: true,
      error: null,
      canCreateJobs: false,
    });

    (hooks.useHealthMetrics as any).mockReturnValue({
      uptime: 0,
      responseTime: 0,
      version: 'unknown',
    });

    render(<HealthIndicator />);

    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  it('renders unhealthy status correctly', () => {
    (hooks.useHealthStatus as any).mockReturnValue({
      status: 'unhealthy',
      isHealthy: false,
      isDegraded: false,
      isLoading: false,
      error: new Error('API unavailable'),
      canCreateJobs: false,
    });

    (hooks.useHealthMetrics as any).mockReturnValue({
      uptime: 0,
      responseTime: 0,
      version: 'unknown',
    });

    render(<HealthIndicator />);

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows details when requested', () => {
    (hooks.useHealthStatus as any).mockReturnValue({
      status: 'healthy',
      isHealthy: true,
      isDegraded: false,
      isLoading: false,
      error: null,
      canCreateJobs: true,
    });

    (hooks.useHealthMetrics as any).mockReturnValue({
      uptime: 3600,
      responseTime: 150,
      version: '1.0.0',
    });

    render(<HealthIndicator showDetails />);

    expect(screen.getByText('Uptime: 60m')).toBeInTheDocument();
    expect(screen.getByText('Response: 150ms')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});