import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { JobActions } from '../JobActions'
import { createMockJob, createMockPendingJob, createMockFailedJob } from '../../test/utils'
import { JobStatus } from '../../types'

describe('JobActions', () => {
  const mockOnViewResults = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows view results button for completed jobs with results', () => {
    const job = createMockJob({ status: JobStatus.COMPLETED })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={true}
        isLoadingResults={false}
      />
    )

    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument()
  })

  it('shows cancel button for pending jobs', () => {
    const job = createMockPendingJob({ status: JobStatus.PENDING })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={false}
        isLoadingResults={false}
      />
    )

    expect(screen.getByRole('button', { name: /cancel job/i })).toBeInTheDocument()
  })

  it('shows retry button for failed jobs', () => {
    const job = createMockFailedJob({ status: JobStatus.FAILED })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={false}
        isLoadingResults={false}
      />
    )

    expect(screen.getByRole('button', { name: /retry job/i })).toBeInTheDocument()
  })

  it('calls onViewResults when view results button is clicked', () => {
    const job = createMockJob({ status: JobStatus.COMPLETED })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={true}
        isLoadingResults={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    expect(mockOnViewResults).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const job = createMockPendingJob({ status: JobStatus.PENDING })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={false}
        isLoadingResults={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel job/i }))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('calls onRetry when retry button is clicked', () => {
    const job = createMockFailedJob({ status: JobStatus.FAILED })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={false}
        isLoadingResults={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /retry job/i }))
    expect(mockOnRetry).toHaveBeenCalled()
  })

  it('shows no results available for completed jobs without results', () => {
    const job = createMockJob({ status: JobStatus.COMPLETED })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={false}
        isLoadingResults={false}
      />
    )

    expect(screen.getByRole('button', { name: /no results available/i })).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const job = createMockJob({ status: JobStatus.COMPLETED })
    render(
      <JobActions
        job={job}
        onViewResults={mockOnViewResults}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        isCancelling={false}
        isRetrying={false}
        hasResults={true}
        isLoadingResults={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })
})