import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import JobForm from '../JobForm'
import { JobFormData } from '../../../schemas/jobSchema'

// Mock the necessary hooks
vi.mock('../../../hooks/useJobManagement', () => ({
  useJobManagement: () => ({
    createJob: vi.fn().mockResolvedValue({ job_id: '123' })
  })
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const mockOnSuccess = vi.fn()

describe('JobForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('without initialValues', () => {
    it('renders form fields correctly with default values', () => {
      render(<JobForm />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      expect(urlInput).toBeInTheDocument()
      expect(urlInput).toHaveValue('')
      expect(screen.getByRole('button', { name: /create job/i })).toBeInTheDocument()
    })

    it('uses default values when no initialValues provided', () => {
      render(<JobForm />)

      // Check that URL field starts empty
      const urlInput = screen.getByPlaceholderText('https://example.com')
      expect(urlInput).toHaveValue('')
      
      // Check that timeout shows default (30 seconds in form summary)
      expect(screen.getByText('30 seconds')).toBeInTheDocument()
    })
  })

  describe('with initialValues', () => {
    const initialValues: Partial<JobFormData> = {
      url: 'https://initial-example.com',
      timeout: 60,
      javascript: true,
      selectors: {
        title: 'h1',
        description: '.description'
      },
      user_agent: 'Custom User Agent',
      headers: {
        'Authorization': 'Bearer token'
      },
      job_metadata: {
        source: 'test'
      }
    }

    it('renders form with initial values populated', () => {
      render(<JobForm initialValues={initialValues} />)

      // URL should be pre-filled
      expect(screen.getByDisplayValue('https://initial-example.com')).toBeInTheDocument()
      
      // Timeout should show initial value in summary
      expect(screen.getByText('60 seconds')).toBeInTheDocument()
      
      // Selectors count should reflect initial values
      expect(screen.getByText('2 configured')).toBeInTheDocument()
    })

    it('preserves initial values when form is reset', async () => {
      const user = userEvent.setup()
      render(<JobForm initialValues={initialValues} />)

      // Change the URL
      const urlInput = screen.getByDisplayValue('https://initial-example.com')
      await user.clear(urlInput)
      await user.type(urlInput, 'https://changed.com')

      // Reset the form
      const resetButton = screen.getByRole('button', { name: /reset form/i })
      await user.click(resetButton)

      // Should return to initial values
      await waitFor(() => {
        expect(screen.getByDisplayValue('https://initial-example.com')).toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    it('validates required URL field', async () => {
      const user = userEvent.setup()
      render(<JobForm onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/url is required/i)).toBeInTheDocument()
      })
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('validates URL format', async () => {
      const user = userEvent.setup()
      render(<JobForm onSuccess={mockOnSuccess} />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      await user.type(urlInput, 'invalid-url')

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
      })
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  describe('form submission', () => {
    it('calls onSuccess with job ID on successful submission', async () => {
      const user = userEvent.setup()
      render(<JobForm onSuccess={mockOnSuccess} />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      await user.type(urlInput, 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('123')
      })
    })

    it('submits with initial values correctly', async () => {
      const user = userEvent.setup()
      const initialValues: Partial<JobFormData> = {
        url: 'https://test.com',
        timeout: 45,
        javascript: true
      }
      
      render(<JobForm initialValues={initialValues} onSuccess={mockOnSuccess} />)

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('123')
      })
    })
  })

  describe('form behavior', () => {
    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      render(<JobForm />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      await user.type(urlInput, 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      // During submission, button should show "Creating..."
      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    it('resets form after successful submission', async () => {
      const user = userEvent.setup()
      render(<JobForm onSuccess={mockOnSuccess} />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      await user.type(urlInput, 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /create job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
      
      // Form should be reset after successful submission
      await waitFor(() => {
        const urlInputAfterReset = screen.getByPlaceholderText('https://example.com')
        expect(urlInputAfterReset).toHaveValue('')
      })
    })
  })
})
