import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import JobCard from '../JobCard'
import { createMockJob, createMockPendingJob } from '../../test/utils'

const mockOnDelete = vi.fn()
const mockOnRetry = vi.fn()

describe('JobCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders job information correctly', () => {
    const job = createMockJob()
    render(
      <JobCard 
        job={job} 
        onDelete={mockOnDelete} 
        onRetry={mockOnRetry} 
      />
    )

    expect(screen.getByText(job.url)).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Example Page')).toBeInTheDocument()
  })

  it('shows pending status for pending jobs', () => {
    const job = createMockPendingJob()
    render(
      <JobCard 
        job={job} 
        onDelete={mockOnDelete} 
        onRetry={mockOnRetry} 
      />
    )

    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.queryByText('Example Page')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const job = createMockJob()
    render(
      <JobCard 
        job={job} 
        onDelete={mockOnDelete} 
        onRetry={mockOnRetry} 
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(job.id)
  })

  it('has proper accessibility attributes', () => {
    const job = createMockJob()
    render(
      <JobCard 
        job={job} 
        onDelete={mockOnDelete} 
        onRetry={mockOnRetry} 
      />
    )

    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('aria-label', `Scraping job for ${job.url}`)
  })

  it('shows formatted dates', () => {
    const job = createMockJob({
      created_at: '2024-01-01T12:00:00Z'
    })
    render(
      <JobCard 
        job={job} 
        onDelete={mockOnDelete} 
        onRetry={mockOnRetry} 
      />
    )

    // Should show some form of date formatting
    expect(screen.getByText(/Jan/i)).toBeInTheDocument()
  })
})