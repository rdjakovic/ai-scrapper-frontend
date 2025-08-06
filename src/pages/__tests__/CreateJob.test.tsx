import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import CreateJob from '../CreateJob'
import * as hooks from '../../hooks'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock the hooks
vi.mock('../../hooks', () => ({
  useJobManagement: vi.fn(),
  useHealthStatus: vi.fn(),
}))

describe('CreateJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create job form', () => {
    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: vi.fn(),
      isCreating: false,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    expect(screen.getByText('Create New Job')).toBeInTheDocument()
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create job/i })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockCreateJob = vi.fn().mockResolvedValue({ id: '123' })

    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: mockCreateJob,
      isCreating: false,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    const urlInput = screen.getByLabelText(/url/i)
    await user.type(urlInput, 'https://example.com')

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateJob).toHaveBeenCalledWith({
        url: 'https://example.com',
        selectors: {},
        timeout: 30000,
        javascript: true,
        headers: {},
        job_metadata: {}
      })
    })
  })

  it('navigates to job detail after successful creation', async () => {
    const user = userEvent.setup()
    const mockCreateJob = vi.fn().mockResolvedValue({ id: '123' })

    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: mockCreateJob,
      isCreating: false,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    const urlInput = screen.getByLabelText(/url/i)
    await user.type(urlInput, 'https://example.com')

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/jobs/123')
    })
  })

  it('shows loading state during creation', () => {
    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: vi.fn(),
      isCreating: true,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows error message when creation fails', () => {
    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: vi.fn(),
      isCreating: false,
      createError: 'Failed to create job'
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    expect(screen.getByText('Failed to create job')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('disables form when API is unhealthy', () => {
    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: vi.fn(),
      isCreating: false,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: false,
      isHealthy: false
    })

    render(<CreateJob />)

    expect(screen.getByText(/api unavailable/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create job/i })).toBeDisabled()
  })

  it('validates form before submission', async () => {
    const user = userEvent.setup()
    const mockCreateJob = vi.fn()

    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: mockCreateJob,
      isCreating: false,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/url is required/i)).toBeInTheDocument()
    })

    expect(mockCreateJob).not.toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    ;(hooks.useJobManagement as any).mockReturnValue({
      createJob: vi.fn(),
      isCreating: false,
      createError: null
    })

    ;(hooks.useHealthStatus as any).mockReturnValue({
      canCreateJobs: true,
      isHealthy: true
    })

    render(<CreateJob />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Create New Job')
  })
})