import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { JobForm } from '../JobForm'

const mockOnSubmit = vi.fn()

describe('JobForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<JobForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create job/i })).toBeInTheDocument()
  })

  it('validates required URL field', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/url is required/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates URL format', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={mockOnSubmit} />)

    const urlInput = screen.getByLabelText(/url/i)
    await user.type(urlInput, 'invalid-url')

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid url format/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={mockOnSubmit} />)

    const urlInput = screen.getByLabelText(/url/i)
    await user.type(urlInput, 'https://example.com')

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        selectors: {},
        timeout: 30000,
        javascript: true,
        headers: {},
        job_metadata: {}
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={mockOnSubmit} isLoading />)

    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDisabled()
  })

  it('allows adding custom selectors', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={mockOnSubmit} />)

    // Expand advanced options
    const advancedToggle = screen.getByText(/advanced options/i)
    await user.click(advancedToggle)

    // Add a selector
    const addSelectorButton = screen.getByRole('button', { name: /add selector/i })
    await user.click(addSelectorButton)

    const selectorNameInput = screen.getByPlaceholderText(/selector name/i)
    const selectorValueInput = screen.getByPlaceholderText(/css selector/i)

    await user.type(selectorNameInput, 'title')
    await user.type(selectorValueInput, 'h1')

    const urlInput = screen.getByLabelText(/url/i)
    await user.type(urlInput, 'https://example.com')

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          selectors: { title: 'h1' }
        })
      )
    })
  })

  it('has proper accessibility attributes', () => {
    render(<JobForm onSubmit={mockOnSubmit} />)

    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()

    const urlInput = screen.getByLabelText(/url/i)
    expect(urlInput).toHaveAttribute('required')
    expect(urlInput).toHaveAttribute('type', 'url')
  })

  it('shows error message when submission fails', () => {
    render(<JobForm onSubmit={mockOnSubmit} error="Failed to create job" />)

    expect(screen.getByText('Failed to create job')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})