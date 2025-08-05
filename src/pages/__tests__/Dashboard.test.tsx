import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import { Dashboard } from '../Dashboard'
import * as hooks from '../../hooks'

// Mock the hooks
vi.mock('../../hooks', () => ({
  useJobs: vi.fn(),
  useHealth: vi.fn(),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard with job statistics', async () => {
    const mockJobs = [
      { id: '1', status: 'completed', url: 'https://example.com' },
      { id: '2', status: 'pending', url: 'https://test.com' },
      { id: '3', status: 'failed', url: 'https://failed.com' }
    ]

    ;(hooks.useJobs as any).mockReturnValue({
      data: { jobs: mockJobs, total: 3 },
      isLoading: false,
      isError: false
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'healthy' },
      isHealthy: true,
      isLoading: false
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Total Jobs')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(hooks.useJobs as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: undefined,
      isLoading: true
    })

    render(<Dashboard />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    ;(hooks.useJobs as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load jobs')
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'healthy' },
      isHealthy: true,
      isLoading: false
    })

    render(<Dashboard />)

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })

  it('displays job statistics correctly', () => {
    const mockJobs = [
      { id: '1', status: 'completed', url: 'https://example.com' },
      { id: '2', status: 'completed', url: 'https://test.com' },
      { id: '3', status: 'pending', url: 'https://pending.com' },
      { id: '4', status: 'failed', url: 'https://failed.com' }
    ]

    ;(hooks.useJobs as any).mockReturnValue({
      data: { jobs: mockJobs, total: 4 },
      isLoading: false,
      isError: false,
      completedJobs: mockJobs.filter(j => j.status === 'completed'),
      pendingJobs: mockJobs.filter(j => j.status === 'pending'),
      failedJobs: mockJobs.filter(j => j.status === 'failed')
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'healthy' },
      isHealthy: true,
      isLoading: false
    })

    render(<Dashboard />)

    expect(screen.getByText('4')).toBeInTheDocument() // Total
    expect(screen.getByText('2')).toBeInTheDocument() // Completed
    expect(screen.getByText('1')).toBeInTheDocument() // Pending and Failed
  })

  it('shows recent jobs section', () => {
    const mockJobs = [
      { 
        id: '1', 
        status: 'completed', 
        url: 'https://example.com',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]

    ;(hooks.useJobs as any).mockReturnValue({
      data: { jobs: mockJobs, total: 1 },
      isLoading: false,
      isError: false
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'healthy' },
      isHealthy: true,
      isLoading: false
    })

    render(<Dashboard />)

    expect(screen.getByText('Recent Jobs')).toBeInTheDocument()
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('shows empty state when no jobs', () => {
    ;(hooks.useJobs as any).mockReturnValue({
      data: { jobs: [], total: 0 },
      isLoading: false,
      isError: false
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'healthy' },
      isHealthy: true,
      isLoading: false
    })

    render(<Dashboard />)

    expect(screen.getByText(/no jobs yet/i)).toBeInTheDocument()
  })

  it('shows health warning when API is unhealthy', () => {
    ;(hooks.useJobs as any).mockReturnValue({
      data: { jobs: [], total: 0 },
      isLoading: false,
      isError: false
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'unhealthy' },
      isHealthy: false,
      isLoading: false
    })

    render(<Dashboard />)

    expect(screen.getByText(/api unavailable/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    ;(hooks.useJobs as any).mockReturnValue({
      data: { jobs: [], total: 0 },
      isLoading: false,
      isError: false
    })

    ;(hooks.useHealth as any).mockReturnValue({
      data: { status: 'healthy' },
      isHealthy: true,
      isLoading: false
    })

    render(<Dashboard />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Dashboard')
  })
})