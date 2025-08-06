import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import UrlInput from '../UrlInput'
import { UseFormRegisterReturn } from 'react-hook-form'

describe('UrlInput', () => {
  const mockRegistration: UseFormRegisterReturn = {
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
    name: 'url'
  }

  it('renders input field correctly', () => {
    render(<UrlInput registration={mockRegistration} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'url')
    expect(input).toHaveAttribute('placeholder', 'https://example.com')
  })

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    const registration = { ...mockRegistration, onChange: mockOnChange }
    render(<UrlInput registration={registration} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'https://test.com')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('shows validation error for invalid URL', () => {
    render(<UrlInput registration={mockRegistration} value="invalid-url" error="Invalid URL format" />)

    expect(screen.getByText('Invalid URL format')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300')
  })

  it('shows valid state for valid URL', () => {
    render(<UrlInput registration={mockRegistration} value="https://example.com" />)

    const input = screen.getByRole('textbox')
    expect(screen.getByText('Valid URL - Domain: example.com')).toBeInTheDocument()
  })

  it('shows URL preview when enabled', () => {
    render(<UrlInput registration={mockRegistration} value="https://example.com" />)

    expect(screen.getByText('Valid URL - Domain: example.com')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<UrlInput registration={mockRegistration} label="Website URL" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows aria-invalid when there is an error', () => {
    render(<UrlInput registration={mockRegistration} value="invalid" error="Invalid URL" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports paste event handling', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    const registration = { ...mockRegistration, onChange: mockOnChange }
    render(<UrlInput registration={registration} />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.paste('https://pasted-url.com')

    expect(mockOnChange).toHaveBeenCalled()
  })
})