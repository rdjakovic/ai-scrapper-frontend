import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { RetryButton } from '../RetryButton'

describe('RetryButton', () => {
  it('renders retry button correctly', () => {
    const mockOnRetry = vi.fn()
    render(<RetryButton onRetry={mockOnRetry} />)
    
    const button = screen.getByRole('button', { name: /retry/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onRetry when clicked', () => {
    const mockOnRetry = vi.fn()
    render(<RetryButton onRetry={mockOnRetry} />)
    
    const button = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(button)
    
    expect(mockOnRetry).toHaveBeenCalledOnce()
  })

  it('shows loading state when isLoading is true', () => {
    const mockOnRetry = vi.fn()
    render(<RetryButton onRetry={mockOnRetry} isLoading />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText(/retrying/i)).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    const mockOnRetry = vi.fn()
    render(<RetryButton onRetry={mockOnRetry} disabled />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders with custom text', () => {
    const mockOnRetry = vi.fn()
    render(<RetryButton onRetry={mockOnRetry} text="Try Again" />)
    
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const mockOnRetry = vi.fn()
    render(<RetryButton onRetry={mockOnRetry} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})