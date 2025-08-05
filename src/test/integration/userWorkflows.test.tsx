import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../providers/ToastProvider'
import App from '../../App'

// Mock the API client
vi.mock('../../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }
}))

// Mock environment
vi.mock('../../config/environment', () => ({
  config: {
    apiBaseUrl: 'http://localhost:8000',
    environment: 'test',
    version: '1.0.0',
    buildTime: '2024-01-01T00:00:00Z',
    features: {
      enableAnalytics: false,
      enableErrorReporting: false,
      enablePerformanceMonitoring: false,
    },
    api: {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    },
    ui: {
      theme: 'light',
      pageSize: 20,
      maxFileSize: 10485760,
    }
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          {children}
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('End-to-End User Workflows', () => {
  let mockApiClient: any

  beforeEach(() => {
    mockApiClient = vi.mocked(require('../../services/api').apiClient)
    
    // Reset all mocks
    mockApiClient.get.mockReset()
    mockApiClient.post.mockReset()
    mockApiClient.delete.mockReset()

    // Default health check response
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'connected',
          redis: 'connected',
          version: '1.0.0',
          uptime: 3600
        })
      }
      
      if (url.includes('/jobs')) {
        return Promise.resolve({
          jobs: [],
          total: 0,
          page: 1,
          limit: 20
        })
      }
      
      return Promise.reject(new Error('Not found'))
    })
  })

  describe('Job Creation Workflow', () => {
    it('should allow user to create a new scraping job', async () => {
      // Mock successful job creation
      mockApiClient.post.mockResolvedValueOnce({
        job_id: 'test-job-1',
        url: 'https://example.com',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Wait for the app to load and health check to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Navigate to create job page (assuming there's a create button or link)
      const createButton = screen.getByRole('button', { name: /create.*job/i })
      fireEvent.click(createButton)

      // Fill out the job creation form
      const urlInput = screen.getByLabelText(/url/i)
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } })

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create.*job|submit/i })
      fireEvent.click(submitButton)

      // Verify API was called correctly
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/jobs', {
          url: 'https://example.com'
        })
      })

      // Verify success message or redirect
      await waitFor(() => {
        expect(screen.getByText(/job.*created|success/i)).toBeInTheDocument()
      })
    })

    it('should show validation errors for invalid input', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /create.*job/i })
      fireEvent.click(createButton)

      // Try to submit with invalid URL
      const urlInput = screen.getByLabelText(/url/i)
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } })

      const submitButton = screen.getByRole('button', { name: /create.*job|submit/i })
      fireEvent.click(submitButton)

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid.*url|url.*required/i)).toBeInTheDocument()
      })

      // API should not be called
      expect(mockApiClient.post).not.toHaveBeenCalled()
    })
  })

  describe('Job Monitoring Workflow', () => {
    it('should display job list and allow monitoring', async () => {
      // Mock jobs list response
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve({ status: 'healthy' })
        }
        
        if (url.includes('/jobs')) {
          return Promise.resolve({
            jobs: [
              {
                job_id: 'job-1',
                url: 'https://example.com',
                status: 'completed',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:05:00Z'
              },
              {
                job_id: 'job-2',
                url: 'https://test.com',
                status: 'in_progress',
                created_at: '2024-01-01T00:10:00Z',
                updated_at: '2024-01-01T00:10:00Z'
              }
            ],
            total: 2,
            page: 1,
            limit: 20
          })
        }
        
        return Promise.reject(new Error('Not found'))
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText('https://example.com')).toBeInTheDocument()
        expect(screen.getByText('https://test.com')).toBeInTheDocument()
      })

      // Verify job statuses are displayed
      expect(screen.getByText(/completed/i)).toBeInTheDocument()
      expect(screen.getByText(/in.progress|running/i)).toBeInTheDocument()

      // Verify API was called
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/jobs'))
    })

    it('should allow viewing job details', async () => {
      // Mock job details response
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve({ status: 'healthy' })
        }
        
        if (url.includes('/jobs/job-1')) {
          return Promise.resolve({
            job_id: 'job-1',
            url: 'https://example.com',
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:05:00Z',
            completed_at: '2024-01-01T00:05:00Z'
          })
        }
        
        if (url.includes('/jobs')) {
          return Promise.resolve({
            jobs: [{
              job_id: 'job-1',
              url: 'https://example.com',
              status: 'completed',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:05:00Z'
            }],
            total: 1
          })
        }
        
        return Promise.reject(new Error('Not found'))
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText('https://example.com')).toBeInTheDocument()
      })

      // Click on job to view details
      const jobLink = screen.getByText('https://example.com')
      fireEvent.click(jobLink)

      // Verify job details are loaded
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/jobs/job-1')
      })
    })
  })

  describe('Results Viewing Workflow', () => {
    it('should display job results when available', async () => {
      // Mock job with results
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve({ status: 'healthy' })
        }
        
        if (url.includes('/results/job-1')) {
          return Promise.resolve({
            job_id: 'job-1',
            url: 'https://example.com',
            status: 'completed',
            data: {
              title: 'Example Page',
              content: 'Sample scraped content',
              links: ['https://example.com/page1', 'https://example.com/page2']
            },
            scraped_at: '2024-01-01T00:05:00Z',
            processing_time: 2.5
          })
        }
        
        if (url.includes('/jobs')) {
          return Promise.resolve({
            jobs: [{
              job_id: 'job-1',
              url: 'https://example.com',
              status: 'completed',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:05:00Z'
            }],
            total: 1
          })
        }
        
        return Promise.reject(new Error('Not found'))
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Wait for jobs to load
      await waitFor(() => {
        expect(screen.getByText('https://example.com')).toBeInTheDocument()
      })

      // Click view results button
      const viewResultsButton = screen.getByRole('button', { name: /view.*results/i })
      fireEvent.click(viewResultsButton)

      // Verify results are displayed
      await waitFor(() => {
        expect(screen.getByText('Example Page')).toBeInTheDocument()
        expect(screen.getByText('Sample scraped content')).toBeInTheDocument()
      })

      // Verify API was called
      expect(mockApiClient.get).toHaveBeenCalledWith('/results/job-1')
    })

    it('should allow exporting results', async () => {
      // Mock successful results fetch
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/results/job-1')) {
          return Promise.resolve({
            job_id: 'job-1',
            data: { title: 'Test', content: 'Content' }
          })
        }
        return Promise.resolve({ jobs: [], total: 0 })
      })

      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn(() => 'mock-url')
      Object.defineProperty(URL, 'createObjectURL', {
        value: mockCreateObjectURL
      })

      // Mock document.createElement and click
      const mockAnchorElement = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const mockCreateElement = vi.fn(() => mockAnchorElement)
      const mockAppendChild = vi.fn()
      const mockRemoveChild = vi.fn()

      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement
      })
      Object.defineProperty(document.body, 'appendChild', {
        value: mockAppendChild
      })
      Object.defineProperty(document.body, 'removeChild', {
        value: mockRemoveChild
      })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Navigate to results view (simplified)
      // In a real test, this would involve navigating through the UI
      
      // Find and click export button
      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      // Select JSON format
      const jsonOption = screen.getByText(/json/i)
      fireEvent.click(jsonOption)

      // Verify export was triggered
      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
        expect(mockAnchorElement.click).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling Scenarios', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockApiClient.get.mockRejectedValue(new Error('API Error'))

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors', async () => {
      // Mock network error
      const networkError = new Error('Network Error')
      networkError.name = 'NetworkError'
      mockApiClient.get.mockRejectedValue(networkError)

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network.*error|connection.*failed/i)).toBeInTheDocument()
      })
    })

    it('should show retry options for failed operations', async () => {
      // Mock initial failure then success
      mockApiClient.get
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ status: 'healthy' })

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // Should show error with retry option
      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /retry|try.*again/i })
      fireEvent.click(retryButton)

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.queryByText(/error|failed/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Check for proper ARIA attributes
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type')
      })

      // Check for proper headings structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Check for proper form labels
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
    })

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Test tab navigation
      const focusableElements = screen.getAllByRole('button')
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
        expect(document.activeElement).toBe(focusableElements[0])

        // Test Enter key activation
        fireEvent.keyDown(focusableElements[0], { key: 'Enter' })
        // Should trigger the button action (tested implicitly)
      }
    })
  })

  describe('Performance Considerations', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeJobsList = Array.from({ length: 1000 }, (_, i) => ({
        job_id: `job-${i}`,
        url: `https://example${i}.com`,
        status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'pending' : 'failed',
        created_at: new Date(Date.now() - i * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 500).toISOString()
      }))

      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/jobs')) {
          return Promise.resolve({
            jobs: largeJobsList.slice(0, 20), // Paginated
            total: largeJobsList.length,
            page: 1,
            limit: 20
          })
        }
        return Promise.resolve({ status: 'healthy' })
      })

      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('https://example0.com')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(5000) // 5 seconds
    })
  })
})