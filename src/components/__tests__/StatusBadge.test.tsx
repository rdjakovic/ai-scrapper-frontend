import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<StatusBadge status="pending" />)
    
    const badge = screen.getByText('Pending')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('renders completed status correctly', () => {
    render(<StatusBadge status="completed" />)
    
    const badge = screen.getByText('Completed')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders failed status correctly', () => {
    render(<StatusBadge status="failed" />)
    
    const badge = screen.getByText('Failed')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('renders running status correctly', () => {
    render(<StatusBadge status="running" />)
    
    const badge = screen.getByText('Running')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('has proper accessibility attributes', () => {
    render(<StatusBadge status="completed" />)
    
    const badge = screen.getByText('Completed')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', 'Job status: completed')
  })
})