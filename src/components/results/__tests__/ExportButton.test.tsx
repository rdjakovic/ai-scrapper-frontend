import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils'
import { ExportButton } from '../ExportButton'

// Mock the export utilities
vi.mock('../../../utils/exportUtils', () => ({
  exportToJSON: vi.fn(),
  exportToCSV: vi.fn(),
  downloadFile: vi.fn()
}))

const mockData = {
  title: 'Example Page',
  description: 'This is an example',
  links: ['https://link1.com', 'https://link2.com']
}

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders export button correctly', () => {
    render(<ExportButton data={mockData} filename="test-export" />)

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('shows format selection dropdown when clicked', () => {
    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    expect(screen.getByText('JSON')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  it('exports data as JSON when JSON option is selected', async () => {
    const { exportToJSON, downloadFile } = await import('../../../utils/exportUtils')
    
    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    const jsonOption = screen.getByText('JSON')
    fireEvent.click(jsonOption)

    await waitFor(() => {
      expect(exportToJSON).toHaveBeenCalledWith(mockData)
      expect(downloadFile).toHaveBeenCalled()
    })
  })

  it('exports data as CSV when CSV option is selected', async () => {
    const { exportToCSV, downloadFile } = await import('../../../utils/exportUtils')
    
    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    const csvOption = screen.getByText('CSV')
    fireEvent.click(csvOption)

    await waitFor(() => {
      expect(exportToCSV).toHaveBeenCalledWith(mockData)
      expect(downloadFile).toHaveBeenCalled()
    })
  })

  it('shows loading state during export', async () => {
    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    const jsonOption = screen.getByText('JSON')
    fireEvent.click(jsonOption)

    // Should show loading state briefly
    expect(screen.getByText(/exporting/i)).toBeInTheDocument()
  })

  it('handles export errors gracefully', async () => {
    const { exportToJSON } = await import('../../../utils/exportUtils')
    ;(exportToJSON as any).mockRejectedValue(new Error('Export failed'))

    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    const jsonOption = screen.getByText('JSON')
    fireEvent.click(jsonOption)

    await waitFor(() => {
      expect(screen.getByText(/export failed/i)).toBeInTheDocument()
    })
  })

  it('is disabled when no data is provided', () => {
    render(<ExportButton data={null} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    expect(exportButton).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    expect(exportButton).toHaveAttribute('aria-haspopup', 'menu')
    expect(exportButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports keyboard navigation', async () => {
    render(<ExportButton data={mockData} filename="test-export" />)

    const exportButton = screen.getByRole('button', { name: /export/i })
    
    // Should be focusable
    exportButton.focus()
    expect(exportButton).toHaveFocus()

    // Should open on Enter
    fireEvent.keyDown(exportButton, { key: 'Enter' })
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })
})