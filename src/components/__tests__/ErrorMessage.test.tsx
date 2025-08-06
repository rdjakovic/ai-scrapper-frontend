import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import ErrorMessage from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('renders error message correctly', () => {
    render(<ErrorMessage message="Something went wrong" />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders with retry button when onRetry is provided', () => {
    const mockRetry = vi.fn()
    render(<ErrorMessage message="Network error" onRetry={mockRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
    
    fireEvent.click(retryButton)
    expect(mockRetry).toHaveBeenCalledOnce()
  })

  it('renders without retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Validation error" />)
    
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ErrorMessage message="Error occurred" />)
    
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<ErrorMessage message="Error" variant="error" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'text-red-800')
    
    rerender(<ErrorMessage message="Warning" variant="warning" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'text-yellow-800')
  })
})