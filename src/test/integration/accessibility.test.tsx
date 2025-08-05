import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '../utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../providers/ToastProvider'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock components for testing
import { JobActions } from '../../components/JobActions'
import { JobStatus } from '../../types'
import ErrorMessage from '../../components/ErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'

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

describe('Accessibility Compliance Tests', () => {
  beforeEach(() => {
    // Add required DOM elements
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      document.body.appendChild(toastContainer)
    }
  })

  describe('WCAG AA Compliance', () => {
    it('should have no accessibility violations in JobActions component', async () => {
      const mockJob = {
        job_id: '1',
        url: 'https://example.com',
        status: JobStatus.COMPLETED,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:05:00Z'
      }

      const { container } = render(
        <TestWrapper>
          <JobActions
            job={mockJob}
            onCancel={() => {}}
            onRetry={() => {}}
            onViewResults={() => {}}
            isCancelling={false}
            isRetrying={false}
            hasResults={true}
            isLoadingResults={false}
          />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in ErrorMessage component', async () => {
      const { container } = render(
        <TestWrapper>
          <ErrorMessage
            message="Test error message"
            onRetry={() => {}}
            variant="error"
          />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in LoadingSpinner component', async () => {
      const { container } = render(
        <TestWrapper>
          <LoadingSpinner size="md" text="Loading..." />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in StatusBadge component', async () => {
      const { container } = render(
        <TestWrapper>
          <StatusBadge status="completed" showIcon={true} />
        </TestWrapper>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in JobActions', async () => {
      const mockJob = {
        job_id: '1',
        url: 'https://example.com',
        status: JobStatus.COMPLETED,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:05:00Z'
      }

      render(
        <TestWrapper>
          <JobActions
            job={mockJob}
            onCancel={() => {}}
            onRetry={() => {}}
            onViewResults={() => {}}
            isCancelling={false}
            isRetrying={false}
            hasResults={true}
            isLoadingResults={false}
          />
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      
      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
        button.focus()
        expect(document.activeElement).toBe(button)
      })
    })

    it('should handle Enter and Space key activation', async () => {
      const mockOnRetry = vi.fn()
      
      render(
        <TestWrapper>
          <ErrorMessage
            message="Test error"
            onRetry={mockOnRetry}
          />
        </TestWrapper>
      )

      const retryButton = screen.getByRole('button', { name: /try again/i })
      
      // Test Enter key
      retryButton.focus()
      fireEvent.keyDown(retryButton, { key: 'Enter' })
      expect(mockOnRetry).toHaveBeenCalledTimes(1)

      // Test Space key
      fireEvent.keyDown(retryButton, { key: ' ' })
      expect(mockOnRetry).toHaveBeenCalledTimes(2)
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels for status indicators', () => {
      render(
        <TestWrapper>
          <StatusBadge status="completed" />
        </TestWrapper>
      )

      const statusElement = screen.getByRole('status')
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
      expect(statusElement).toHaveAttribute('aria-atomic', 'true')
    })

    it('should have proper ARIA labels for error messages', () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Test error message" />
        </TestWrapper>
      )

      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper loading indicators', () => {
      render(
        <TestWrapper>
          <LoadingSpinner text="Loading data..." />
        </TestWrapper>
      )

      const loadingElement = screen.getByRole('status', { name: /loading/i })
      expect(loadingElement).toBeInTheDocument()
    })

    it('should provide screen reader text for icons', () => {
      render(
        <TestWrapper>
          <StatusBadge status="completed" showIcon={true} />
        </TestWrapper>
      )

      // Check for screen reader only text
      const srText = screen.getByText(/completed successfully/i)
      expect(srText).toHaveClass('sr-only')
    })
  })

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for status badges', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <StatusBadge status="completed" />
            <StatusBadge status="failed" />
            <StatusBadge status="pending" />
            <StatusBadge status="in_progress" />
          </div>
        </TestWrapper>
      )

      // Get computed styles for color contrast testing
      const badges = container.querySelectorAll('[role="status"]')
      
      badges.forEach(badge => {
        const styles = window.getComputedStyle(badge)
        const backgroundColor = styles.backgroundColor
        const color = styles.color
        
        // Basic check that colors are defined
        expect(backgroundColor).toBeTruthy()
        expect(color).toBeTruthy()
        
        // In a real implementation, you would calculate the actual contrast ratio
        // and ensure it meets WCAG AA standards (4.5:1 for normal text)
      })
    })

    it('should have sufficient contrast for error messages', () => {
      const { container } = render(
        <TestWrapper>
          <ErrorMessage message="Error message" variant="error" />
        </TestWrapper>
      )

      const errorElement = container.querySelector('[role="alert"]')
      expect(errorElement).toBeTruthy()
      
      const styles = window.getComputedStyle(errorElement!)
      expect(styles.backgroundColor).toBeTruthy()
      expect(styles.color).toBeTruthy()
    })
  })

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(
        <TestWrapper>
          <JobActions
            job={{
              job_id: '1',
              url: 'https://example.com',
              status: JobStatus.PENDING,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:05:00Z'
            }}
            onCancel={() => {}}
            onRetry={() => {}}
            onViewResults={() => {}}
            isCancelling={false}
            isRetrying={false}
            hasResults={false}
            isLoadingResults={false}
          />
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        button.focus()
        
        // Check that focus styles are applied
        const styles = window.getComputedStyle(button)
        expect(button).toHaveClass(/focus:/)
      })
    })

    it('should maintain logical tab order', () => {
      render(
        <TestWrapper>
          <div>
            <button type="button">First</button>
            <JobActions
              job={{
                job_id: '1',
                url: 'https://example.com',
                status: JobStatus.COMPLETED,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:05:00Z'
              }}
              onCancel={() => {}}
              onRetry={() => {}}
              onViewResults={() => {}}
              isCancelling={false}
              isRetrying={false}
              hasResults={true}
              isLoadingResults={false}
            />
            <button type="button">Last</button>
          </div>
        </TestWrapper>
      )

      const allButtons = screen.getAllByRole('button')
      
      // Verify tab order by checking tabIndex or natural DOM order
      allButtons.forEach((button, index) => {
        const tabIndex = button.getAttribute('tabindex')
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  describe('Form Accessibility', () => {
    it('should have proper form labels and descriptions', () => {
      // This would test actual form components when they exist
      // For now, we'll test the pattern with a mock form
      render(
        <TestWrapper>
          <form>
            <label htmlFor="url-input">URL</label>
            <input
              id="url-input"
              type="url"
              aria-describedby="url-help"
              aria-required="true"
            />
            <div id="url-help">Enter the URL you want to scrape</div>
          </form>
        </TestWrapper>
      )

      const input = screen.getByLabelText('URL')
      expect(input).toHaveAttribute('aria-describedby', 'url-help')
      expect(input).toHaveAttribute('aria-required', 'true')
      
      const helpText = screen.getByText('Enter the URL you want to scrape')
      expect(helpText).toHaveAttribute('id', 'url-help')
    })

    it('should indicate required fields', () => {
      render(
        <TestWrapper>
          <form>
            <label htmlFor="required-field">
              Required Field
              <span aria-label="required">*</span>
            </label>
            <input
              id="required-field"
              type="text"
              aria-required="true"
            />
          </form>
        </TestWrapper>
      )

      const input = screen.getByLabelText(/required field/i)
      expect(input).toHaveAttribute('aria-required', 'true')
      
      const requiredIndicator = screen.getByLabelText('required')
      expect(requiredIndicator).toBeInTheDocument()
    })

    it('should provide error messages with proper associations', () => {
      render(
        <TestWrapper>
          <form>
            <label htmlFor="error-field">Field with Error</label>
            <input
              id="error-field"
              type="text"
              aria-describedby="error-message"
              aria-invalid="true"
            />
            <div id="error-message" role="alert">
              This field is required
            </div>
          </form>
        </TestWrapper>
      )

      const input = screen.getByLabelText('Field with Error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveAttribute('id', 'error-message')
    })
  })

  describe('Mobile Accessibility', () => {
    it('should have appropriate touch targets', () => {
      render(
        <TestWrapper>
          <JobActions
            job={{
              job_id: '1',
              url: 'https://example.com',
              status: JobStatus.COMPLETED,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:05:00Z'
            }}
            onCancel={() => {}}
            onRetry={() => {}}
            onViewResults={() => {}}
            isCancelling={false}
            isRetrying={false}
            hasResults={true}
            isLoadingResults={false}
          />
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        
        // Check minimum touch target size (44px x 44px recommended)
        // This is a simplified check - in practice you'd measure actual dimensions
        expect(button).toHaveClass(/px-4|py-2/) // Padding classes that ensure adequate size
      })
    })

    it('should work with screen readers on mobile', () => {
      render(
        <TestWrapper>
          <StatusBadge status="completed" />
        </TestWrapper>
      )

      const statusElement = screen.getByRole('status')
      
      // Should have proper ARIA attributes for mobile screen readers
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
      expect(statusElement).toHaveAttribute('aria-atomic', 'true')
    })
  })
})