import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import Dashboard from '../Dashboard'
import * as hooks from '../../hooks'

// Mock the hooks
vi.mock('../../hooks', () => ({
  useHealthStatus: vi.fn(),
  useJobDashboard: vi.fn(),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard with job statistics', async () => {
    const mockJobs = [
      { job_id: '1', status: 'completed', url: 'https://example.com', created_at: '2024-01-01T00:00:00Z' },
      { job_id: '2', status: 'pending', url: 'https://test.com', created_at: '2024-01-01T00:00:00Z' },
      { job_id: '3', status: 'failed', url: 'https://failed.com', created_at: '2024-01-01T00:00:00Z' }
    ]

    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 3,
      activeCount: 1,
      completedCount: 1,
      failedCount: 1,
      recentJobs: mockJobs,
      isLoading: false
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Total Jobs')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 0,
      activeCount: 0,
      completedCount: 0,
      failedCount: 0,
      recentJobs: [],
      isLoading: true
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 0,
      activeCount: 0,
      completedCount: 0,
      failedCount: 0,
      recentJobs: [],
      isLoading: false,
      error: new Error('Failed to load jobs')
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('displays job statistics correctly', () => {
    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 4,
      activeCount: 1,
      completedCount: 2,
      failedCount: 1,
      recentJobs: [],
      isLoading: false
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    expect(screen.getByText('4')).toBeInTheDocument() // Total
    expect(screen.getByText('2')).toBeInTheDocument() // Completed
    expect(screen.getByText('1')).toBeInTheDocument() // Active and Failed
  })

  it('shows recent jobs section', () => {
    const mockJobs = [
      { 
        job_id: '1', 
        status: 'completed', 
        url: 'https://example.com',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]

    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 1,
      activeCount: 0,
      completedCount: 1,
      failedCount: 0,
      recentJobs: mockJobs,
      isLoading: false
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    expect(screen.getByText('Recent Jobs')).toBeInTheDocument()
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('shows empty state when no jobs', () => {
    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 0,
      activeCount: 0,
      completedCount: 0,
      failedCount: 0,
      recentJobs: [],
      isLoading: false
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    expect(screen.getByText(/no jobs yet/i)).toBeInTheDocument()
  })

  it('shows health warning when API is unhealthy', () => {
    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 0,
      activeCount: 0,
      completedCount: 0,
      failedCount: 0,
      recentJobs: [],
      isLoading: false
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: false,
      isHealthy: false
    })

    render(<Dashboard />)

    expect(screen.getByText(/API Not Ready/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    ;(hooks.useJobDashboard as any).mockReturnValue({
      totalJobs: 0,
      activeCount: 0,
      completedCount: 0,
      failedCount: 0,
      recentJobs: [],
      isLoading: false
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<Dashboard />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Dashboard')
  })
})