import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import { SelectorBuilder } from '../SelectorBuilder'

describe('SelectorBuilder', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty selector builder', () => {
    render(<SelectorBuilder selectors={} onChange={mockOnChange} />)

    expect(screen.getByText(/css selectors/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add selector/i })).toBeInTheDocument()
  })

  it('renders existing selectors', () => {
    const selectors = { title: 'h1', description: '.description' }
    render(<SelectorBuilder selectors={selectors} onChange={mockOnChange} />)

    expect(screen.getByDisplayValue('title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('h1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('.description')).toBeInTheDocument()
  })

  it('adds new selector when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<SelectorBuilder selectors={} onChange={mockOnChange} />)

    const addButton = screen.getByRole('button', { name: /add selector/i })
    await user.click(addButton)

    expect(screen.getByPlaceholderText(/selector name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/css selector/i)).toBeInTheDocument()
  })

  it('updates selector when input changes', async () => {
    const user = userEvent.setup()
    render(<SelectorBuilder selectors={{}} onChange={mockOnChange} />)

    // Add a selector first
    const addButton = screen.getByRole('button', { name: /add selector/i })
    await user.click(addButton)

    const nameInput = screen.getByPlaceholderText(/selector name/i)
    const valueInput = screen.getByPlaceholderText(/css selector/i)

    await user.type(nameInput, 'title')
    await user.type(valueInput, 'h1')

    expect(mockOnChange).toHaveBeenCalledWith({ title: 'h1' })
  })

  it('removes selector when remove button is clicked', async () => {
    const user = userEvent.setup()
    const selectors = { title: 'h1', description: '.description' }
    render(<SelectorBuilder selectors={selectors} onChange={mockOnChange} />)

    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])

    expect(mockOnChange).toHaveBeenCalledWith({ description: '.description' })
  })

  it('validates selector names are unique', async () => {
    const user = userEvent.setup()
    render(<SelectorBuilder selectors={{ title: 'h1' }} onChange={mockOnChange} />)

    // Add another selector
    const addButton = screen.getByRole('button', { name: /add selector/i })
    await user.click(addButton)

    const nameInput = screen.getByPlaceholderText(/selector name/i)
    await user.type(nameInput, 'title')

    expect(screen.getByText(/selector name must be unique/i)).toBeInTheDocument()
  })

  it('shows CSS selector validation', async () => {
    const user = userEvent.setup()
    render(<SelectorBuilder selectors={{}} onChange={mockOnChange} />)

    const addButton = screen.getByRole('button', { name: /add selector/i })
    await user.click(addButton)

    const valueInput = screen.getByPlaceholderText(/css selector/i)
    await user.type(valueInput, 'invalid[selector')

    expect(screen.getByText(/invalid css selector/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<SelectorBuilder selectors={{ title: 'h1' }} onChange={mockOnChange} />)

    const fieldset = screen.getByRole('group')
    expect(fieldset).toHaveAttribute('aria-labelledby')
    
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label')
    })
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<SelectorBuilder selectors={{}} onChange={mockOnChange} />)

    const addButton = screen.getByRole('button', { name: /add selector/i })
    await user.click(addButton)

    const nameInput = screen.getByPlaceholderText(/selector name/i)
    const valueInput = screen.getByPlaceholderText(/css selector/i)

    // Tab navigation should work
    await user.tab()
    expect(nameInput).toHaveFocus()

    await user.tab()
    expect(valueInput).toHaveFocus()
  })
})