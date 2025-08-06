import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import JobForm from '../JobForm'
import { JobFormData } from '../../../schemas/jobSchema'

// Mock the necessary hooks
const mockCreateJob = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../../hooks/useJobManagement', () => ({
  useJobManagement: () => ({
    createJob: mockCreateJob
  })
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('JobForm Clone Mode Integration', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateJob.mockResolvedValue({ job_id: 'new-cloned-job-456' })
  })

  describe('Complete Clone Workflow', () => {
    it('should successfully clone a job with pre-filled data', async () => {
      const user = userEvent.setup()
      
      // Pre-filled data from a job being cloned
      const initialValues: Partial<JobFormData> = {
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
        }
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          onSuccess={mockOnSuccess} 
          mode="clone" 
        />
      )

      // Verify the form is pre-filled with cloned job data
      expect(screen.getByDisplayValue('https://example.com/test-page')).toBeInTheDocument()
      
      // Verify selectors are loaded (3 configured)
      expect(screen.getByText('3 configured')).toBeInTheDocument()
      
      // Verify timeout is pre-filled
      expect(screen.getByText('45 seconds')).toBeInTheDocument()
      
      // Verify it's in clone mode
      expect(screen.getByRole('button', { name: /clone job/i })).toBeInTheDocument()

      // Submit the form without modifications
      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Verify loading state shows "Cloning..."
      expect(screen.getByText('Cloning...')).toBeInTheDocument()
      expect(screen.getByText('Cloning job...')).toBeInTheDocument()

      // Verify createJob was called with the correct data
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
          job_metadata: undefined
        })
      })

      // Verify success callback was called
      expect(mockOnSuccess).toHaveBeenCalledWith('new-cloned-job-456')
    })

    it('should allow editing fields before cloning', async () => {
      const user = userEvent.setup()
      
      const initialValues: Partial<JobFormData> = {
        url: 'https://original.com',
        timeout: 30,
        javascript: false,
        selectors: {
          title: 'h1'
        }
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          onSuccess={mockOnSuccess} 
          mode="clone" 
        />
      )

      // Edit the URL
      const urlInput = screen.getByDisplayValue('https://original.com')
      await user.clear(urlInput)
      await user.type(urlInput, 'https://modified.com')

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
          url: 'https://modified.com',
          selectors: expect.objectContaining({
            title: 'h1',
            author: '.author-name'
          }),
          timeout: 30,
          javascript: false,
          wait_for: undefined,
          user_agent: undefined,
          headers: undefined,
          job_metadata: undefined
        })
      })
    })

    it('should handle clone errors appropriately', async () => {
      const user = userEvent.setup()
      
      // Mock createJob to fail
      mockCreateJob.mockRejectedValue(new Error('Server error'))
      
      const initialValues: Partial<JobFormData> = {
        url: 'https://example.com'
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          onSuccess={mockOnSuccess} 
          mode="clone" 
        />
      )

      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/error creating job/i)).toBeInTheDocument()
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })

      // Verify onSuccess was not called
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should validate fields before allowing clone', async () => {
      const user = userEvent.setup()
      
      // Start with invalid data (empty URL)
      const initialValues: Partial<JobFormData> = {
        url: ''
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          onSuccess={mockOnSuccess} 
          mode="clone" 
        />
      )

      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      
      // Button should be disabled due to validation
      expect(cloneButton).toBeDisabled()

      // Try to click anyway
      await user.click(cloneButton)

      // Should show validation error
      expect(screen.getByText(/url is required/i)).toBeInTheDocument()

      // createJob should not have been called
      expect(mockCreateJob).not.toHaveBeenCalled()
    })

    it('should reset form after successful clone', async () => {
      const user = userEvent.setup()
      
      const initialValues: Partial<JobFormData> = {
        url: 'https://example.com',
        timeout: 60
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          onSuccess={mockOnSuccess} 
          mode="clone" 
        />
      )

      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Wait for success
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })

      // Form should be reset to initial values
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument()
        expect(screen.getByText('60 seconds')).toBeInTheDocument()
      })
    })
  })

  describe('Clone Mode UI Differences', () => {
    it('should show clone-specific button text and styling', () => {
      const initialValues: Partial<JobFormData> = {
        url: 'https://example.com'
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          mode="clone" 
        />
      )

      // Should show "Clone Job" button instead of "Create Job"
      expect(screen.getByRole('button', { name: /clone job/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^create job$/i })).not.toBeInTheDocument()

      // Button should have purple styling (clone mode)
      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      expect(cloneButton).toHaveClass(/purple/)
    })

    it('should show clone-specific loading states', async () => {
      const user = userEvent.setup()
      
      const initialValues: Partial<JobFormData> = {
        url: 'https://example.com'
      }

      render(
        <JobForm 
          initialValues={initialValues} 
          mode="clone" 
        />
      )

      const cloneButton = screen.getByRole('button', { name: /clone job/i })
      await user.click(cloneButton)

      // Should show clone-specific loading text
      expect(screen.getByText('Cloning...')).toBeInTheDocument()
      expect(screen.getByText('Cloning job...')).toBeInTheDocument()
    })
  })
})
