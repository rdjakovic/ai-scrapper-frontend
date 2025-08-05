import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { JobActions } from '../JobActions'
import { createMockJob, createMockPendingJob, createMockFailedJob } from '../../test/utils'

describe('JobActions', () => {
  const mockOnView = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnRetry = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows view results button for completed jobs', () => {
    const job = createMockJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows cancel button for pending jobs', () => {
    const job = createMockPendingJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows retry button for failed jobs', () => {
    const job = createMockFailedJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls onView when view results button is clicked', () => {
    const job = createMockJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /view results/i }))
    expect(mockOnView).toHaveBeenCalledWith(job.id)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const job = createMockPendingJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalledWith(job.id)
  })

  it('calls onRetry when retry button is clicked', () => {
    const job = createMockFailedJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(mockOnRetry).toHaveBeenCalledWith(job.id)
  })

  it('calls onDelete when delete button is clicked', () => {
    const job = createMockJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockOnDelete).toHaveBeenCalledWith(job.id)
  })

  it('has proper accessibility attributes', () => {
    const job = createMockJob()
    render(
      <JobActions
        job={job}
        onView={mockOnView}
        onCancel={mockOnCancel}
        onRetry={mockOnRetry}
        onDelete={mockOnDelete}
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })
})