import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import Jobs from '../Jobs'

// Mock the API module
vi.mock('../../api/jobs', () => ({
  fetchJobs: vi.fn().mockResolvedValue({
    jobs: [
      {
        id: '1',
        url: 'https://example.com',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:05:00Z',
        result: { title: 'Example Page' },
      },
    ],
  }),
  createJob: vi.fn(),
  deleteJob: vi.fn(),
}))

describe('Jobs Page', () => {
  it('renders the jobs page with job list', async () => {
    render(<Jobs />)

    // Check for page title
    expect(screen.getByText('Scraping Jobs')).toBeInTheDocument()

    // Check for URL input
    expect(screen.getByPlaceholderText('Enter URL to scrape...')).toBeInTheDocument()

    // Wait for jobs to load
    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })

    // Check for job status
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<Jobs />)

    // Should show some loading indication
    expect(screen.getByText('Scraping Jobs')).toBeInTheDocument()
  })
})