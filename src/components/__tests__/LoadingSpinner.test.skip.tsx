import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="large" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner.querySelector('svg')).toHaveClass('h-8', 'w-8')
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Processing..." />)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-live', 'polite')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })
})