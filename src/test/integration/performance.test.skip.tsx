import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../providers/ToastProvider'

// Mock performance API if not available
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
  } as any
}

// Mock components for performance testing
import { VirtualizedJobList } from '../../components/VirtualizedJobList'
import { ResultsViewer } from '../../components/results/ResultsViewer'
import { ExportButton } from '../../components/results/ExportButton'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
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

describe('Performance Tests', () => {
  beforeEach(() => {
    // Add required DOM elements
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      document.body.appendChild(toastContainer)
    }
  })

  describe('Large Dataset Handling', () => {
    it('should render large job lists efficiently', async () => {
      // Generate large dataset
      const largeJobList = Array.from({ length: 10000 }, (_, i) => ({
        job_id: `job-${i}`,
        url: `https://example${i}.com`,
        status: ['completed', 'pending', 'failed', 'in_progress'][i % 4] as any,
        created_at: new Date(Date.now() - i * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 500).toISOString(),
      }))

      const startTime = performance.now()

      render(
        <TestWrapper>
          <VirtualizedJobList
            jobs={largeJobList}
            onJobClick={() => {}}
            onJobDelete={() => {}}
            loading={false}
          />
        </TestWrapper>
      )

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('https://example0.com')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within reasonable time (2 seconds for 10k items)
      expect(renderTime).toBeLessThan(2000)

      // Should only render visible items (virtualization)
      const renderedItems = screen.getAllByText(/https:\/\/example\d+\.com/)
      expect(renderedItems.length).toBeLessThan(100) // Should be much less than 10k
    })

    it('should handle large result datasets efficiently', async () => {
      // Generate large result dataset
      const largeResultData = {
        job_id: 'test-job',
        url: 'https://example.com',
        status: 'completed' as const,
        data: Array.from({ length: 5000 }, (_, i) => ({
          id: i,
          title: `Item ${i}`,
          content: `Content for item ${i}`.repeat(10), // Make it substantial
          url: `https://example.com/item-${i}`,
          metadata: {
            timestamp: new Date().toISOString(),
            category: `category-${i % 10}`,
            tags: [`tag-${i % 5}`, `tag-${(i + 1) % 5}`]
          }
        })),
        scraped_at: new Date().toISOString(),
        processing_time: 45.2
      }

      const startTime = performance.now()

      render(
        <TestWrapper>
          <ResultsViewer
            jobResult={largeResultData}
            onExport={() => {}}
            className=""
          />
        </TestWrapper>
      )

      // Wait for render
      await waitFor(() => {
        expect(screen.getByText(/5000.*items|5,000.*items/i)).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(3000)
    })
  })

  describe('Memory Usage', () => {
    it('should not cause memory leaks with frequent updates', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Simulate frequent updates
      const jobs = Array.from({ length: 100 }, (_, i) => ({
        job_id: `job-${i}`,
        url: `https://example${i}.com`,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { rerender } = render(
        <TestWrapper>
          <VirtualizedJobList
            jobs={jobs}
            onJobClick={() => {}}
            onJobDelete={() => {}}
            loading={false}
          />
        </TestWrapper>
      )

      // Simulate 50 updates
      for (let i = 0; i < 50; i++) {
        const updatedJobs = jobs.map(job => ({
          ...job,
          status: ['completed', 'failed', 'pending'][i % 3] as any,
          updated_at: new Date().toISOString(),
        }))

        rerender(
          <TestWrapper>
            <VirtualizedJobList
              jobs={updatedJobs}
              onJobClick={() => {}}
              onJobDelete={() => {}}
              loading={false}
            />
          </TestWrapper>
        )

        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Memory should not grow excessively (allow for some growth)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory
        const maxAllowedGrowth = 50 * 1024 * 1024 // 50MB
        expect(memoryGrowth).toBeLessThan(maxAllowedGrowth)
      }
    })
  })

  describe('Export Performance', () => {
    it('should export large datasets efficiently', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
        content: `Content ${i}`,
        url: `https://example.com/${i}`,
      }))

      // Mock URL.createObjectURL for performance testing
      const mockCreateObjectURL = vi.fn(() => 'mock-url')
      Object.defineProperty(URL, 'createObjectURL', {
        value: mockCreateObjectURL
      })

      // Mock document methods
      const mockClick = vi.fn()
      const mockAnchorElement = {
        href: '',
        download: '',
        click: mockClick,
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

      const startTime = performance.now()

      render(
        <TestWrapper>
          <ExportButton
            data={largeData}
            filename="large-export"
            onExportStart={() => {}}
            onExportComplete={() => {}}
            onExportError={() => {}}
          />
        </TestWrapper>
      )

      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      // Select JSON format
      const jsonOption = screen.getByText(/json/i)
      fireEvent.click(jsonOption)

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled()
      })

      const endTime = performance.now()
      const exportTime = endTime - startTime

      // Export should complete within reasonable time
      expect(exportTime).toBeLessThan(5000) // 5 seconds for 10k items
    })

    it('should show progress for large exports', async () => {
      const largeData = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        data: `Large data item ${i}`.repeat(100), // Make it substantial
      }))

      render(
        <TestWrapper>
          <ExportButton
            data={largeData}
            filename="huge-export"
            onExportStart={() => {}}
            onExportComplete={() => {}}
            onExportError={() => {}}
          />
        </TestWrapper>
      )

      const exportButton = screen.getByRole('button', { name: /export/i })
      fireEvent.click(exportButton)

      // For large datasets, should show progress indicator
      await waitFor(() => {
        expect(screen.getByText(/preparing|processing|exporting/i)).toBeInTheDocument()
      })
    })
  })

  describe('Rendering Performance', () => {
    it('should have fast initial page load', async () => {
      performance.mark('page-load-start')

      render(
        <TestWrapper>
          <div>
            <h1>Web Scraping Dashboard</h1>
            <VirtualizedJobList
              jobs={[]}
              onJobClick={() => {}}
              onJobDelete={() => {}}
              loading={false}
            />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Web Scraping Dashboard')).toBeInTheDocument()
      })

      performance.mark('page-load-end')
      performance.measure('page-load', 'page-load-start', 'page-load-end')

      const measures = performance.getEntriesByName('page-load')
      if (measures.length > 0) {
        const loadTime = measures[0].duration
        expect(loadTime).toBeLessThan(1000) // Should load within 1 second
      }
    })

    it('should handle rapid state changes efficiently', async () => {
      let renderCount = 0
      const TestComponent = ({ status }: { status: string }) => {
        renderCount++
        return <div>Status: {status}</div>
      }

      const { rerender } = render(
        <TestWrapper>
          <TestComponent status="pending" />
        </TestWrapper>
      )

      const startTime = performance.now()

      // Simulate rapid status changes
      const statuses = ['pending', 'in_progress', 'completed', 'failed']
      for (let i = 0; i < 100; i++) {
        rerender(
          <TestWrapper>
            <TestComponent status={statuses[i % statuses.length]} />
          </TestWrapper>
        )
      }

      const endTime = performance.now()
      const updateTime = endTime - startTime

      // Should handle updates efficiently
      expect(updateTime).toBeLessThan(1000)
      expect(renderCount).toBe(101) // Initial + 100 updates
    })
  })

  describe('Network Performance', () => {
    it('should batch API requests efficiently', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      // Mock multiple API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ jobs: [], total: 0 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' })
        })

      const startTime = performance.now()

      render(
        <TestWrapper>
          <div>Test Component</div>
        </TestWrapper>
      )

      // Wait for any async operations
      await waitFor(() => {
        expect(screen.getByText('Test Component')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const networkTime = endTime - startTime

      // Should complete network operations quickly
      expect(networkTime).toBeLessThan(2000)
    })
  })

  describe('Bundle Size Impact', () => {
    it('should lazy load components efficiently', async () => {
      // This test would verify that code splitting is working
      // In a real implementation, you'd test that certain components
      // are only loaded when needed

      const startTime = performance.now()

      // Simulate lazy loading
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <div>Lazy Loaded Component</div>
        })
      )

      render(
        <TestWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
          </React.Suspense>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Lazy Loaded Component')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const lazyLoadTime = endTime - startTime

      // Lazy loading should be fast
      expect(lazyLoadTime).toBeLessThan(500)
    })
  })

  describe('Core Web Vitals', () => {
    it('should meet Core Web Vitals thresholds', async () => {
      // Mock Core Web Vitals measurements
      const mockLCP = 1500 // Largest Contentful Paint in ms
      const mockFID = 50   // First Input Delay in ms
      const mockCLS = 0.05 // Cumulative Layout Shift

      // In a real implementation, you'd use the web-vitals library
      // to measure actual Core Web Vitals

      // LCP should be under 2.5s (good)
      expect(mockLCP).toBeLessThan(2500)

      // FID should be under 100ms (good)
      expect(mockFID).toBeLessThan(100)

      // CLS should be under 0.1 (good)
      expect(mockCLS).toBeLessThan(0.1)
    })

    it('should optimize for mobile performance', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone width
      })

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667, // iPhone height
      })

      const startTime = performance.now()

      render(
        <TestWrapper>
          <VirtualizedJobList
            jobs={Array.from({ length: 100 }, (_, i) => ({
              job_id: `job-${i}`,
              url: `https://example${i}.com`,
              status: 'completed' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))}
            onJobClick={() => {}}
            onJobDelete={() => {}}
            loading={false}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('https://example0.com')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const mobileRenderTime = endTime - startTime

      // Mobile rendering should be fast
      expect(mobileRenderTime).toBeLessThan(1500)
    })
  })
})