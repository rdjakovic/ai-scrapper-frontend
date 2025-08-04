import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { UrlInput } from '../UrlInput'

const mockOnSubmit = vi.fn()

describe('UrlInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input field and submit button', () => {
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />)

    expect(screen.getByPlaceholderText('Enter URL to scrape...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /scrape/i })).toBeInTheDocument()
  })

  it('validates URL format', async () => {
    const user = userEvent.setup()
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />)

    const input = screen.getByPlaceholderText('Enter URL to scrape...')
    const submitButton = screen.getByRole('button', { name: /scrape/i })

    await user.type(input, 'invalid-url')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits valid URL', async () => {
    const user = userEvent.setup()
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />)

    const input = screen.getByPlaceholderText('Enter URL to scrape...')
    const submitButton = screen.getByRole('button', { name: /scrape/i })

    await user.type(input, 'https://example.com')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com')
    })
  })

  it('shows loading state', () => {
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /scraping/i })
    expect(submitButton).toBeDisabled()
  })

  it('clears input after successful submission', async () => {
    const user = userEvent.setup()
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />)

    const input = screen.getByPlaceholderText('Enter URL to scrape...') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /scrape/i })

    await user.type(input, 'https://example.com')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('has proper accessibility attributes', () => {
    render(<UrlInput onSubmit={mockOnSubmit} isLoading={false} />)

    const input = screen.getByPlaceholderText('Enter URL to scrape...')
    expect(input).toHaveAttribute('aria-label', 'URL to scrape')
    expect(input).toHaveAttribute('type', 'url')
  })
})