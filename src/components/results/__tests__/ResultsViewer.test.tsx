import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test/utils'
import { ResultsViewer } from '../ResultsViewer'

const mockResults = {
  job_id: '1',
  url: 'https://example.com',
  status: 'completed' as const,
  data: {
    title: 'Example Page',
    description: 'This is an example page',
    links: ['https://link1.com', 'https://link2.com']
  },
  scraped_at: '2024-01-01T00:00:00Z',
  processing_time: 1500
}

describe('ResultsViewer', () => {
  it('renders results data correctly', () => {
    render(<ResultsViewer results={mockResults} />)

    expect(screen.getByText('Example Page')).toBeInTheDocument()
    expect(screen.getByText('This is an example page')).toBeInTheDocument()
    expect(screen.getByText('https://link1.com')).toBeInTheDocument()
  })

  it('shows different view modes', () => {
    render(<ResultsViewer results={mockResults} />)

    // Should have view mode buttons
    expect(screen.getByRole('button', { name: /table view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /json view/i })).toBeInTheDocument()
  })

  it('switches between view modes', () => {
    render(<ResultsViewer results={mockResults} />)

    const jsonViewButton = screen.getByRole('button', { name: /json view/i })
    fireEvent.click(jsonViewButton)

    // Should show JSON view
    expect(screen.getByText(/"title"/)).toBeInTheDocument()
  })

  it('shows export button', () => {
    render(<ResultsViewer results={mockResults} />)

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('displays metadata information', () => {
    render(<ResultsViewer results={mockResults} />)

    expect(screen.getByText(/scraped at/i)).toBeInTheDocument()
    expect(screen.getByText(/processing time/i)).toBeInTheDocument()
    expect(screen.getByText('1.5s')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    const emptyResults = { ...mockResults, data: null }
    render(<ResultsViewer results={emptyResults} />)

    expect(screen.getByText(/no data available/i)).toBeInTheDocument()
  })

  it('shows screenshot viewer when screenshot is available', () => {
    const resultsWithScreenshot = { ...mockResults, screenshot: 'base64-image-data' }
    render(<ResultsViewer results={resultsWithScreenshot} />)

    expect(screen.getByRole('button', { name: /view screenshot/i })).toBeInTheDocument()
  })

  it('shows raw HTML viewer when available', () => {
    const resultsWithHtml = { ...mockResults, raw_html: '<html><body>Test</body></html>' }
    render(<ResultsViewer results={resultsWithHtml} />)

    expect(screen.getByRole('button', { name: /view html/i })).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ResultsViewer results={mockResults} />)

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-label', 'Scraping results')

    const viewModeButtons = screen.getAllByRole('button')
    viewModeButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('handles large datasets with pagination', () => {
    const largeData = {
      items: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
    }
    const largeResults = { ...mockResults, data: largeData }
    
    render(<ResultsViewer results={largeResults} />)

    // Should show pagination controls
    expect(screen.getByText(/showing/i)).toBeInTheDocument()
  })
})