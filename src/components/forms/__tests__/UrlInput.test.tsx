import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { UrlInput } from '../UrlInput'

describe('UrlInput', () => {
  it('renders input field correctly', () => {
    render(<UrlInput value="" onChange={vi.fn()} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'url')
    expect(input).toHaveAttribute('placeholder', 'https://example.com')
  })

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    render(<UrlInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'https://test.com')

    expect(mockOnChange).toHaveBeenCalledWith('https://test.com')
  })

  it('shows validation error for invalid URL', () => {
    render(<UrlInput value="invalid-url" onChange={vi.fn()} error="Invalid URL format" />)

    expect(screen.getByText('Invalid URL format')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300')
  })

  it('shows valid state for valid URL', () => {
    render(<UrlInput value="https://example.com" onChange={vi.fn()} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-green-300')
  })

  it('shows URL preview when enabled', () => {
    render(<UrlInput value="https://example.com" onChange={vi.fn()} showPreview />)

    expect(screen.getByText('Preview: https://example.com')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<UrlInput value="" onChange={vi.fn()} label="Website URL" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Website URL')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows aria-invalid when there is an error', () => {
    render(<UrlInput value="invalid" onChange={vi.fn()} error="Invalid URL" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports paste event handling', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    render(<UrlInput value="" onChange={mockOnChange} />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.paste('https://pasted-url.com')

    expect(mockOnChange).toHaveBeenCalledWith('https://pasted-url.com')
  })
})