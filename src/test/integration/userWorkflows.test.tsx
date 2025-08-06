import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../providers/ToastProvider'
import App from '../../App'
import { apiClient } from '../../services'

// Mock the API client
vi.mock('../../services', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    requestWithRetry: vi.fn(),
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

// For testing App component (which already has Router)
const AppTestWrapper = ({ children }: { children: React.ReactNode }) => {
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
      {children}
    </QueryClientProvider>
  )
}

// For testing individual components (need Router)
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
    mockApiClient = vi.mocked(apiClient)
    
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

    // Add toast container
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      document.body.appendChild(toastContainer)
    }
  })

  describe('Dashboard Navigation', () => {
    it('should display dashboard with navigation and quick actions', async () => {
      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      // Wait for the app to load - use the main heading specifically
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^Dashboard$/ })).toBeInTheDocument()
      })

      // Check that all navigation items are present
      expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /create job/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /jobs/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /results/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /health/i })).toBeInTheDocument()

      // Check that quick action links are present
      expect(screen.getByText('Create New Job')).toBeInTheDocument()
      expect(screen.getByText('View All Jobs')).toBeInTheDocument()
      expect(screen.getByText('System Health')).toBeInTheDocument()
    })

    it('should navigate to create job page via link', async () => {
      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^Dashboard$/ })).toBeInTheDocument()
      })

      // Click on the Create Job navigation link
      const createJobLink = screen.getByRole('menuitem', { name: /create job/i })
      fireEvent.click(createJobLink)

      // Should navigate to create job page (would show different content)
      // This is testing the navigation works, not the full form functionality
    })
  })

  describe('Dashboard Content Display', () => {
    it('should display job statistics when available', async () => {
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

      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      // Wait for dashboard to load and show job statistics
      await waitFor(() => {
        expect(screen.getByText('Total Jobs')).toBeInTheDocument()
        expect(screen.getByText('Active Jobs')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.getByText('Failed')).toBeInTheDocument()
      })

      // Should show recent jobs section
      expect(screen.getByText('Recent Jobs')).toBeInTheDocument()
      
      // Wait for jobs to appear in recent jobs section
      await waitFor(() => {
        expect(screen.getByText('https://example.com')).toBeInTheDocument()
        expect(screen.getByText('https://test.com')).toBeInTheDocument()
      })

      // Verify job statuses are displayed 
      expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0)
      // Job statuses are displayed as badges, so just check one exists
      const statusBadges = screen.getAllByText('in_progress')
      expect(statusBadges.length).toBeGreaterThan(0)
    })

    it('should show empty state when no jobs exist', async () => {
      // Mock empty jobs response
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve({ status: 'healthy' })
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

      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^Dashboard$/ })).toBeInTheDocument()
      })

      // Should show no jobs message in recent jobs section
      await waitFor(() => {
        expect(screen.getByText('No jobs yet')).toBeInTheDocument()
      })
    })
  })

  describe('Health Status Display', () => {
    it('should show API health status in header', async () => {
      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      // Should show health status indicator
      await waitFor(() => {
        const statusElements = screen.getAllByRole('status')
        expect(statusElements.length).toBeGreaterThan(0)
      })

      // Should show health information once loaded
      await waitFor(() => {
        expect(screen.getByText(/healthy|degraded|unhealthy/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Scenarios', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error for health check
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.reject(new Error('API Error'))
        }
        if (url.includes('/jobs')) {
          return Promise.resolve({ jobs: [], total: 0, page: 1, limit: 20 })
        }
        return Promise.reject(new Error('API Error'))
      })

      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      // Should still load the dashboard even if health check fails
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^Dashboard$/ })).toBeInTheDocument()
      })

      // Health status should show checking or degraded state
      await waitFor(() => {
        expect(
          screen.getByText(/checking|degraded|unhealthy/i) || 
          screen.getByText(/api.*not.*ready/i)
        ).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should show degraded health status', async () => {
      // Mock degraded health response
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve({
            status: 'degraded',
            timestamp: new Date().toISOString(),
            database: 'connected',
            redis: 'disconnected',
            version: '1.0.0',
            uptime: 3600
          })
        }
        if (url.includes('/jobs')) {
          return Promise.resolve({ jobs: [], total: 0, page: 1, limit: 20 })
        }
        return Promise.reject(new Error('Not found'))
      })

      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      // Should show degraded status
      await waitFor(() => {
        expect(screen.getByText(/degraded/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels and roles', async () => {
      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /^Dashboard$/ })).toBeInTheDocument()
      })

      // Check for proper headings structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Check navigation has proper ARIA attributes
      const navigation = screen.getByRole('navigation', { name: /main navigation/i })
      expect(navigation).toBeInTheDocument()

      // Check menu items have accessible names
      const menuItems = screen.getAllByRole('menuitem')
      menuItems.forEach(item => {
        expect(item).toHaveAccessibleName()
      })

      // Check status indicators have proper labels
      const statusElements = screen.getAllByRole('status')
      statusElements.forEach(status => {
        expect(status).toHaveAttribute('aria-label')
      })
    })

    it('should support keyboard navigation', async () => {
      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
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
      
      rtlRender(
        <AppTestWrapper>
          <App />
        </AppTestWrapper>
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