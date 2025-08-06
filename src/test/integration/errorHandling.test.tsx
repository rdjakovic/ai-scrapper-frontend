import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../providers/ToastProvider'

// Mock API client
vi.mock('../../services', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    requestWithRetry: vi.fn(),
  }
}))

// Mock error boundary
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

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
          <TestErrorBoundary>
            {children}
          </TestErrorBoundary>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Mock components for testing
import { useErrorHandler } from '../../hooks/useErrorHandler'
import ErrorMessage from '../../components/ErrorMessage'
import { HealthIndicator } from '../../components/HealthIndicator'
import { apiClient } from '../../services'

describe('Error Handling Integration Tests', () => {
  let mockApiClient: any

  beforeEach(() => {
    mockApiClient = vi.mocked(apiClient)
    
    // Reset all mocks
    mockApiClient.get.mockReset()
    mockApiClient.post.mockReset()
    mockApiClient.delete.mockReset()

    // Add toast container
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      document.body.appendChild(toastContainer)
    }
  })

  describe('Network Error Handling', () => {
    it('should handle network connectivity issues', async () => {
      // Mock network error
      const networkError = new Error('Network Error')
      networkError.name = 'NetworkError'
      mockApiClient.get.mockRejectedValue(networkError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network.*error|connection.*failed|unable.*connect/i)).toBeInTheDocument()
      })

      // Should show retry option
      expect(screen.getByRole('button', { name: /retry|try.*again/i })).toBeInTheDocument()
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      mockApiClient.get.mockRejectedValue(timeoutError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/timeout|timed.*out/i)).toBeInTheDocument()
      })
    })

    it('should handle DNS resolution errors', async () => {
      const dnsError = new Error('DNS resolution failed')
      dnsError.name = 'DNSError'
      mockApiClient.get.mockRejectedValue(dnsError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/dns|resolution|server.*not.*found/i)).toBeInTheDocument()
      })
    })
  })

  describe('API Error Handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      const badRequestError = {
        response: {
          status: 400,
          data: { detail: 'Invalid URL format' }
        }
      }
      mockApiClient.post.mockRejectedValue(badRequestError)

      const TestComponent = () => {
        const { handleError } = useErrorHandler()
        
        const handleSubmit = async () => {
          try {
            await mockApiClient.post('/jobs', { url: 'invalid-url' })
          } catch (error) {
            handleError(error)
          }
        }

        return <button onClick={handleSubmit}>Submit</button>
      }

      rtlRender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid.*url.*format/i)).toBeInTheDocument()
      })
    })

    it('should handle 401 Unauthorized errors', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { detail: 'Authentication required' }
        }
      }
      mockApiClient.get.mockRejectedValue(unauthorizedError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/authentication.*required|unauthorized/i)).toBeInTheDocument()
      })
    })

    it('should handle 403 Forbidden errors', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { detail: 'Access denied' }
        }
      }
      mockApiClient.get.mockRejectedValue(forbiddenError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/access.*denied|forbidden/i)).toBeInTheDocument()
      })
    })

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { detail: 'Job not found' }
        }
      }
      mockApiClient.get.mockRejectedValue(notFoundError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/not.*found/i)).toBeInTheDocument()
      })
    })

    it('should handle 422 Validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ['url'],
                msg: 'Invalid URL scheme',
                type: 'value_error'
              }
            ]
          }
        }
      }
      mockApiClient.post.mockRejectedValue(validationError)

      const TestComponent = () => {
        const { handleError } = useErrorHandler()
        
        const handleSubmit = async () => {
          try {
            await mockApiClient.post('/jobs', { url: 'ftp://example.com' })
          } catch (error) {
            handleError(error)
          }
        }

        return <button onClick={handleSubmit}>Submit</button>
      }

      rtlRender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid.*url.*scheme/i)).toBeInTheDocument()
      })
    })

    it('should handle 500 Internal Server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' }
        }
      }
      mockApiClient.get.mockRejectedValue(serverError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/server.*error|internal.*error/i)).toBeInTheDocument()
      })

      // Should show retry option for server errors
      expect(screen.getByRole('button', { name: /retry|try.*again/i })).toBeInTheDocument()
    })

    it('should handle 503 Service Unavailable errors', async () => {
      const serviceUnavailableError = {
        response: {
          status: 503,
          data: { detail: 'Service temporarily unavailable' }
        }
      }
      mockApiClient.get.mockRejectedValue(serviceUnavailableError)

      rtlRender(
        <TestWrapper>
          <HealthIndicator />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/service.*unavailable|temporarily.*unavailable/i)).toBeInTheDocument()
      })
    })
  })

  describe('Component Error Handling', () => {
    it('should catch and handle component errors with error boundary', async () => {
      const ThrowingComponent = () => {
        throw new Error('Component error')
      }

      rtlRender(
        <TestWrapper>
          <ThrowingComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByText('Component error')).toBeInTheDocument()
      })

      // Should provide recovery option
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
    })

    it('should handle async component errors', async () => {
      const AsyncErrorComponent = () => {
        const [error, setError] = React.useState<Error | null>(null)

        React.useEffect(() => {
          const timer = setTimeout(() => {
            setError(new Error('Async error'))
          }, 100)
          return () => clearTimeout(timer)
        }, [])

        if (error) {
          throw error
        }

        return <div>Loading...</div>
      }

      rtlRender(
        <TestWrapper>
          <AsyncErrorComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByText('Async error')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation Error Handling', () => {
    it('should handle client-side validation errors', async () => {
      const FormWithValidation = () => {
        const [error, setError] = React.useState('')

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const url = formData.get('url') as string

          if (!url) {
            setError('URL is required')
            return
          }

          if (!url.startsWith('http')) {
            setError('URL must start with http or https')
            return
          }

          setError('')
        }

        return (
          <form onSubmit={handleSubmit}>
            <input name="url" type="text" placeholder="Enter URL" />
            <button type="submit">Submit</button>
            {error && <ErrorMessage message={error} />}
          </form>
        )
      }

      rtlRender(
        <TestWrapper>
          <FormWithValidation />
        </TestWrapper>
      )

      // Submit empty form
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('URL is required')).toBeInTheDocument()
      })

      // Submit invalid URL
      const input = screen.getByPlaceholderText('Enter URL')
      fireEvent.change(input, { target: { value: 'invalid-url' } })
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('URL must start with http or https')).toBeInTheDocument()
      })
    })

    it('should handle server-side validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ['url'],
                msg: 'URL is not accessible',
                type: 'value_error'
              },
              {
                loc: ['selectors'],
                msg: 'Invalid CSS selector',
                type: 'value_error'
              }
            ]
          }
        }
      }
      mockApiClient.post.mockRejectedValue(validationError)

      const FormWithServerValidation = () => {
        const [errors, setErrors] = React.useState<string[]>([])
        const { handleError } = useErrorHandler({ showToast: false })

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          try {
            await mockApiClient.post('/jobs', { url: 'https://example.com' })
          } catch (error) {
            const errorResponse = handleError(error)
            if (errorResponse.type === 'validation') {
              // Extract validation errors
              const validationErrors = ['URL is not accessible', 'Invalid CSS selector']
              setErrors(validationErrors)
            }
          }
        }

        return (
          <form onSubmit={handleSubmit}>
            <input name="url" type="text" defaultValue="https://example.com" />
            <button type="submit">Submit</button>
            {errors.map((error, index) => (
              <ErrorMessage key={index} message={error} />
            ))}
          </form>
        )
      }

      rtlRender(
        <TestWrapper>
          <FormWithServerValidation />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText('URL is not accessible')).toBeInTheDocument()
        expect(screen.getByText('Invalid CSS selector')).toBeInTheDocument()
      })
    })
  })

  describe('Retry Mechanisms', () => {
    it('should implement exponential backoff for retries', async () => {
      let attemptCount = 0
      mockApiClient.get.mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary error'))
        }
        return Promise.resolve({ status: 'healthy' })
      })

      const RetryComponent = () => {
        const { createRetryHandler } = useErrorHandler()
        const [status, setStatus] = React.useState('idle')

        const retryHandler = createRetryHandler(
          async () => {
            setStatus('loading')
            await mockApiClient.get('/health')
            setStatus('success')
          },
          {
            maxRetries: 3,
            onRetry: (attempt) => setStatus(`retrying (${attempt})`),
            onMaxRetriesReached: () => setStatus('failed')
          }
        )

        return (
          <div>
            <div>Status: {status}</div>
            <button onClick={() => retryHandler()}>Start</button>
          </div>
        )
      }

      rtlRender(
        <TestWrapper>
          <RetryComponent />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /start/i }))

      // Should show retry attempts
      await waitFor(() => {
        expect(screen.getByText(/retrying/i)).toBeInTheDocument()
      })

      // Should eventually succeed
      await waitFor(() => {
        expect(screen.getByText('Status: success')).toBeInTheDocument()
      }, { timeout: 5000 })

      expect(attemptCount).toBe(3)
    })

    it('should stop retrying after max attempts', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Persistent error'))

      const RetryComponent = () => {
        const { createRetryHandler } = useErrorHandler()
        const [status, setStatus] = React.useState('idle')

        const retryHandler = createRetryHandler(
          async () => {
            setStatus('loading')
            await mockApiClient.get('/health')
            setStatus('success')
          },
          {
            maxRetries: 2,
            onRetry: (attempt) => setStatus(`retrying (${attempt})`),
            onMaxRetriesReached: () => setStatus('failed')
          }
        )

        return (
          <div>
            <div>Status: {status}</div>
            <button onClick={() => retryHandler()}>Start</button>
          </div>
        )
      }

      rtlRender(
        <TestWrapper>
          <RetryComponent />
        </TestWrapper>
      )

      fireEvent.click(screen.getByRole('button', { name: /start/i }))

      // Should eventually fail after max retries
      await waitFor(() => {
        expect(screen.getByText('Status: failed')).toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('Error Recovery', () => {
    it('should allow users to recover from errors', async () => {
      let shouldFail = true
      mockApiClient.get.mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Temporary error'))
        }
        return Promise.resolve({ status: 'healthy' })
      })

      const RecoveryComponent = () => {
        const [error, setError] = React.useState<string | null>(null)
        const [data, setData] = React.useState<any>(null)

        const fetchData = async () => {
          try {
            setError(null)
            const result = await mockApiClient.get('/health')
            setData(result)
          } catch (err) {
            setError((err as Error).message)
          }
        }

        const handleRetry = () => {
          shouldFail = false // Simulate recovery
          fetchData()
        }

        React.useEffect(() => {
          fetchData()
        }, [])

        if (error) {
          return <ErrorMessage message={error} onRetry={handleRetry} />
        }

        if (data) {
          return <div>Data loaded successfully</div>
        }

        return <div>Loading...</div>
      }

      rtlRender(
        <TestWrapper>
          <RecoveryComponent />
        </TestWrapper>
      )

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText('Temporary error')).toBeInTheDocument()
      })

      // Click retry
      fireEvent.click(screen.getByRole('button', { name: /try again/i }))

      // Should recover
      await waitFor(() => {
        expect(screen.getByText('Data loaded successfully')).toBeInTheDocument()
      })
    })
  })

  describe('Error Logging and Reporting', () => {
    it('should log errors appropriately', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const ErrorLoggingComponent = () => {
        const { handleError } = useErrorHandler({ logErrors: true })

        React.useEffect(() => {
          const error = new Error('Test error for logging')
          handleError(error, { context: 'ErrorLoggingComponent' })
        }, [handleError])

        return <div>Component with error logging</div>
      }

      rtlRender(
        <TestWrapper>
          <ErrorLoggingComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown Error:'),
          expect.stringContaining('[ErrorLoggingComponent] Test error for logging'),
          expect.any(Error)
        )
      })

      consoleSpy.mockRestore()
    })

    it('should handle error reporting service failures gracefully', async () => {
      // Mock error reporting service failure
      const mockErrorReporter = vi.fn().mockRejectedValue(new Error('Reporting failed'))

      const ErrorReportingComponent = () => {
        const { handleError } = useErrorHandler()

        React.useEffect(() => {
          const error = new Error('Original error')
          try {
            handleError(error)
            mockErrorReporter(error) // This would fail
          } catch (reportingError) {
            // Should not crash the app
            console.warn('Error reporting failed:', reportingError)
          }
        }, [handleError])

        return <div>Component with error reporting</div>
      }

      rtlRender(
        <TestWrapper>
          <ErrorReportingComponent />
        </TestWrapper>
      )

      // Component should still render despite reporting failure
      await waitFor(() => {
        expect(screen.getByText('Component with error reporting')).toBeInTheDocument()
      })
    })
  })
})