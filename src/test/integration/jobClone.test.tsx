import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../providers/ToastProvider'
import CloneJobPage from '../../pages/CloneJobPage'
import JobForm from '../../components/forms/JobForm'
import { Job, JobStatus } from '../../types'
import { JobFormData } from '../../schemas/jobSchema'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockUseParams = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  }
})

// Mock toast provider
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('../../providers/ToastProvider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}))

// Mock hooks
vi.mock('../../hooks/useJob')
vi.mock('../../hooks/useJobManagement')

const TestWrapper = ({ children, initialEntries = ['/'] }: { 
  children: React.ReactNode,
  initialEntries?: string[]
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Job Clone Integration Tests', () => {
  let mockCreateJob: any
  let mockUseJob: any

  const mockJob: Job = {
    job_id: 'test-job-123',
    url: 'https://example.com/test-page',
    status: JobStatus.COMPLETED,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:05:00Z',
    completed_at: '2024-01-15T10:05:00Z',
    job_metadata: {
      selectors: {
        title: 'h1.main-title',
        price: '.price-value',
        description: '.product-description'
      },
      wait_for: '.content-loaded',
      timeout: 45,
      javascript: true,
      user_agent: 'Custom Scraper Bot/1.0',
      headers: {
        'Authorization': 'Bearer test-token',
        'X-Custom-Header': 'test-value'
      }
    }
  }

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockShowSuccess.mockClear()
    mockShowError.mockClear()
    
    // Set default params
    mockUseParams.mockReturnValue({ jobId: 'test-job-123' })
    
    // Mock createJob function
    mockCreateJob = vi.fn().mockResolvedValue({
      job_id: 'new-cloned-job-456',
      url: 'https://example.com/test-page',
      status: 'pending'
    })
    
    // Mock useJobManagement hook
    vi.mocked(require('../../hooks/useJobManagement')).useJobManagement = vi.fn(() => ({
      createJob: mockCreateJob
    }))
    
    // Mock useJob hook
    mockUseJob = vi.fn(() => ({
      data: mockJob,
      isLoading: false,
      error: null
    }))
    vi.mocked(require('../../hooks/useJob')).useJob = mockUseJob
  })

  describe('Complete Clone Workflow', () => {
    it('should successfully clone a job with pre-filled form data', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Verify the job data is loaded and form is pre-filled
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      })

      // Verify advanced options are pre-filled (check timeout in summary)
      expect(screen.getByText('45 seconds')).toBeInTheDocument()

      // Verify selectors are pre-filled
      expect(screen.getByText('3 configured')).toBeInTheDocument()

      // Verify form is in clone mode
      expect(screen.getByRole('button', { name: /clone job/i })).toBeInTheDocument()

      // Submit the clone form without modifications
      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Verify loading state during cloning
      expect(screen.getByText('Cloning...')).toBeInTheDocument()

      // Verify createJob was called with correct data
      await waitFor(() => {
        expect(mockCreateJob).toHaveBeenCalledWith({
          url: 'https://example.com/test-page',
          selectors: {
            title: 'h1.main-title',
            price: '.price-value',
            description: '.product-description'
          },
          wait_for: '.content-loaded',
          timeout: 45,
          javascript: true,
          user_agent: 'Custom Scraper Bot/1.0',
          headers: {
            'Authorization': 'Bearer test-token',
            'X-Custom-Header': 'test-value'
          },
          job_metadata: {}
        })
      })

      // Verify success notification
      expect(mockShowSuccess).toHaveBeenCalledWith('Job cloned successfully!')

      // Verify navigation to new job
      expect(mockNavigate).toHaveBeenCalledWith('/jobs/new-cloned-job-456')
    })

    it('should allow editing form fields before cloning', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Wait for form to be pre-filled
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      })

      // Edit the URL
      const urlInput = screen.getByDisplayValue('https://example.com/test-page')
      await user.clear(urlInput)
      await user.type(urlInput, 'https://modified.com/different-page')

      // Open advanced options to modify timeout
      const advancedToggle = screen.getByRole('button', { name: /advanced options/i })
      await user.click(advancedToggle)

      // Edit timeout
      const timeoutInput = screen.getByLabelText(/timeout/i)
      await user.clear(timeoutInput)
      await user.type(timeoutInput, '60')

      // Add a new selector
      const newFieldName = screen.getByPlaceholderText('Field name (e.g., title, price, description)')
      const newSelector = screen.getByPlaceholderText('CSS selector (e.g., h1, .title, #main-content)')
      
      await user.type(newFieldName, 'author')
      await user.type(newSelector, '.author-name')
      
      const addSelectorButton = screen.getByRole('button', { name: /add selector/i })
      await user.click(addSelectorButton)

      // Submit the modified form
      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Verify createJob was called with modified data
      await waitFor(() => {
        expect(mockCreateJob).toHaveBeenCalledWith({
          url: 'https://modified.com/different-page',
          selectors: expect.objectContaining({
            title: 'h1.main-title',
            price: '.price-value',
            description: '.product-description',
            author: '.author-name'
          }),
          wait_for: '.content-loaded',
          timeout: 60,
          javascript: true,
          user_agent: 'Custom Scraper Bot/1.0',
          headers: {
            'Authorization': 'Bearer test-token',
            'X-Custom-Header': 'test-value'
          },
          job_metadata: {}
        })
      })
    })

    it('should handle clone errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock createJob to reject
      mockCreateJob.mockRejectedValue(new Error('Failed to create job'))
      
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      })

      // Submit the form
      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to create job/i)).toBeInTheDocument()
      })

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(mockShowSuccess).not.toHaveBeenCalled()
    })

    it('should handle missing job data appropriately', async () => {
      // Mock useJob to return no data
      mockUseJob.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Job not found')
      })
      
      render(
        <TestWrapper initialEntries={['/clone/nonexistent-job']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/job not found/i)).toBeInTheDocument()
      })

      // Should not show the form
      expect(screen.queryByRole('button', { name: /clone job/i })).not.toBeInTheDocument()
    })

    it('should show loading state while fetching job data', async () => {
      // Mock useJob to return loading state
      mockUseJob.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })
      
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Should show loading spinner
      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Should not show the form yet
      expect(screen.queryByRole('button', { name: /clone job/i })).not.toBeInTheDocument()
    })
  })

  describe('Form Pre-population Edge Cases', () => {
    it('should handle job with minimal metadata', async () => {
      const minimalJob: Job = {
        job_id: 'minimal-job',
        url: 'https://simple.com',
        status: JobStatus.COMPLETED,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:05:00Z',
        job_metadata: {}
      }

      mockUseJob.mockReturnValue({
        data: minimalJob,
        isLoading: false,
        error: null
      })
      
      render(
        <TestWrapper initialEntries={['/clone/minimal-job']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Should pre-fill URL
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://simple.com')).toBeInTheDocument()
      })

      // Should show default values for missing metadata
      expect(screen.getByText('30 seconds')).toBeInTheDocument() // default timeout
      expect(screen.getByText('0 configured')).toBeInTheDocument() // no selectors
    })

    it('should handle job with invalid metadata types', async () => {
      const invalidJob: Job = {
        job_id: 'invalid-job',
        url: 'https://test.com',
        status: JobStatus.COMPLETED,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:05:00Z',
        job_metadata: {
          selectors: 'invalid-string-instead-of-object' as any,
          timeout: 'invalid-string-timeout' as any,
          javascript: 'true' as any, // string instead of boolean
        }
      }

      mockUseJob.mockReturnValue({
        data: invalidJob,
        isLoading: false,
        error: null
      })
      
      render(
        <TestWrapper initialEntries={['/clone/invalid-job']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Should still render form with safe defaults
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument()
      })

      // Should handle invalid metadata gracefully
      expect(screen.getByText('0 configured')).toBeInTheDocument() // selectors fallback
      expect(screen.getByText('30 seconds')).toBeInTheDocument() // timeout fallback
    })
  })

  describe('Navigation and URL Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock navigate to throw error
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed')
      })
      
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Wait for form to load and submit
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      })

      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Should still show success message but handle navigation error
      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith('Job cloned successfully!')
        expect(mockShowError).toHaveBeenCalledWith(
          'Failed to navigate to the new job. Please check the jobs list.'
        )
      })
    })
  })

  describe('Accessibility and UX', () => {
    it('should have proper accessibility attributes in clone mode', async () => {
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      })

      // Check clone button has proper attributes
      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      expect(cloneButton).toBeInTheDocument()
      expect(cloneButton).toHaveAttribute('type', 'submit')

      // Check form inputs have labels
      const urlInput = screen.getByDisplayValue('https://example.com/test-page')
      expect(urlInput).toHaveAccessibleName()
    })

    it('should provide clear feedback during clone process', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper initialEntries={['/clone/test-job-123']}>
          <CloneJobPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      })

      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Should show "Cloning..." state
      expect(screen.getByText('Cloning...')).toBeInTheDocument()
      expect(screen.getByText('Cloning job...')).toBeInTheDocument()

      // Button should be disabled during submission
      expect(cloneButton).toBeDisabled()
    })
  })
})
