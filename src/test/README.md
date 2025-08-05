# Comprehensive Testing Setup

This directory contains the comprehensive testing configuration and utilities for the web scraping UI application.

## Testing Stack

- **Vitest**: Fast unit test framework with Vite integration
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for testing
- **MSW (Mock Service Worker)**: API mocking for tests
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## Test Categories

### Unit Tests
- **Location**: `src/**/__tests__/*.test.tsx`
- **Purpose**: Test individual components, hooks, and utilities in isolation
- **Coverage**: All React components, custom hooks, utility functions
- **Tools**: Vitest, React Testing Library, Jest DOM

### Integration Tests
- **Location**: `src/services/__tests__/*.test.ts`
- **Purpose**: Test API service layer and data flow between components
- **Coverage**: API clients, service functions, data transformations
- **Tools**: MSW for API mocking, Vitest

### Form Validation Tests
- **Location**: `src/components/forms/__tests__/*.test.tsx`
- **Purpose**: Test form validation, user interactions, and submission flows
- **Coverage**: JobForm, UrlInput, SelectorBuilder, validation logic
- **Tools**: React Testing Library, User Event

### State Management Tests
- **Location**: `src/hooks/__tests__/*.test.tsx`
- **Purpose**: Test React Query hooks and state management
- **Coverage**: useJobs, useJob, useHealth, useResults hooks
- **Tools**: React Query test utilities, MSW

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- JobCard.test.tsx

# Run tests matching pattern
npm test -- --grep "form validation"

# Run tests with verbose output
npm test -- --reporter=verbose
```

## File Structure

```
src/test/
├── setup.ts              # Test setup and global configuration
├── utils.tsx              # Custom render function and test utilities
├── testRunner.ts          # Comprehensive test suite runner
├── mocks/
│   ├── server.ts          # MSW server setup
│   ├── handlers.ts        # API mock handlers
│   └── apiClient.ts       # Mock API client for testing
└── README.md              # This comprehensive guide
```

## Test Coverage

### Components Tested
- ✅ HealthIndicator - Health status display with metrics
- ✅ JobCard - Job information display and actions
- ✅ StatusBadge - Status indicators with accessibility
- ✅ LoadingSpinner - Loading states and animations
- ✅ ErrorMessage - Error display with retry functionality
- ✅ RetryButton - Retry actions with loading states
- ✅ JobActions - Job action buttons (view, cancel, retry, delete)
- ✅ JobForm - Job creation form with validation
- ✅ UrlInput - URL input with validation and preview
- ✅ SelectorBuilder - CSS selector builder interface
- ✅ ResultsViewer - Results display with multiple view modes
- ✅ ExportButton - Data export functionality
- ✅ Breadcrumb - Navigation breadcrumbs
- ✅ RouteGuard - Route protection and navigation

### Hooks Tested
- ✅ useJobs - Job listing with pagination and filtering
- ✅ useJob - Individual job fetching with polling
- ✅ useHealth - Health status monitoring
- ✅ useErrorHandler - Error handling and user feedback

### Services Tested
- ✅ jobService - Job CRUD operations and API integration
- ✅ healthService - Health monitoring and connectivity checks

### Utilities Tested
- ✅ validation - Input validation and sanitization
- ✅ errorHandling - Error processing and user messaging
- ✅ exportUtils - Data export functionality

### Pages Tested
- ✅ Dashboard - Main dashboard with statistics
- ✅ CreateJob - Job creation page with form
- ✅ Jobs - Job listing page

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const mockOnClick = vi.fn()
    render(<MyComponent onClick={mockOnClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalledOnce()
  })

  it('has proper accessibility attributes', () => {
    render(<MyComponent />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })
})
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMyHook } from '../useMyHook'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useMyHook', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useMyHook(), { 
      wrapper: createWrapper() 
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(result.current.data).toBeDefined()
  })
})
```

### Form Tests

```typescript
import userEvent from '@testing-library/user-event'

describe('JobForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={vi.fn()} />)

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/url is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    render(<JobForm onSubmit={mockOnSubmit} />)

    const urlInput = screen.getByLabelText(/url/i)
    await user.type(urlInput, 'https://example.com')

    const submitButton = screen.getByRole('button', { name: /create job/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        selectors: {},
        timeout: 30000,
        javascript: true,
        headers: {},
        job_metadata: {}
      })
    })
  })
})
```

### Service Tests

```typescript
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import * as jobService from '../jobService'

describe('jobService', () => {
  it('fetches jobs successfully', async () => {
    const mockJobs = [{ id: '1', url: 'https://example.com', status: 'completed' }]

    server.use(
      http.get('/api/jobs', () => {
        return HttpResponse.json({ jobs: mockJobs, total: 1 })
      })
    )

    const result = await jobService.getJobs()
    expect(result.jobs).toEqual(mockJobs)
  })

  it('handles API errors', async () => {
    server.use(
      http.get('/api/jobs', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    await expect(jobService.getJobs()).rejects.toThrow()
  })
})
```

## Mock Data Factories

Use the factory functions in `utils.tsx` for consistent test data:

```typescript
import { 
  createMockJob, 
  createMockPendingJob, 
  createMockFailedJob 
} from '../../test/utils'

// Create mock jobs with default values
const completedJob = createMockJob()
const pendingJob = createMockPendingJob()
const failedJob = createMockFailedJob()

// Create mock jobs with custom values
const customJob = createMockJob({ 
  url: 'https://custom.com',
  status: 'completed',
  result: { title: 'Custom Title' }
})
```

## API Mocking

### MSW Handlers
API calls are automatically mocked using MSW. Handlers are defined in `mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/jobs', () => {
    return HttpResponse.json({ jobs: [], total: 0 })
  }),
  
  http.post('/api/jobs', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'new-job-id',
      ...body,
      status: 'pending',
      created_at: new Date().toISOString()
    })
  })
]
```

### Runtime Handler Override
Override handlers in individual tests:

```typescript
import { server } from '../../test/mocks/server'

test('handles server error', async () => {
  server.use(
    http.get('/api/jobs', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 })
    })
  )
  
  // Test error handling
})
```

## Accessibility Testing

All component tests include accessibility checks:

```typescript
it('has proper accessibility attributes', () => {
  render(<StatusBadge status="completed" />)
  
  const badge = screen.getByText('Completed')
  expect(badge).toHaveAttribute('role', 'status')
  expect(badge).toHaveAttribute('aria-label', 'Job status: completed')
})

it('supports keyboard navigation', async () => {
  const user = userEvent.setup()
  render(<JobForm onSubmit={vi.fn()} />)
  
  const urlInput = screen.getByLabelText(/url/i)
  await user.tab()
  expect(urlInput).toHaveFocus()
})
```

## Performance Testing

Use performance utilities for testing performance-critical components:

```typescript
import { testUtils } from '../test/testRunner'

it('renders large lists efficiently', async () => {
  const largeJobList = Array.from({ length: 1000 }, (_, i) => 
    createMockJob({ id: `${i}` })
  )
  
  const renderTime = await testUtils.measurePerformance(async () => {
    render(<JobList jobs={largeJobList} />)
  })
  
  expect(renderTime).toBeLessThan(100) // Should render in under 100ms
})
```

## Coverage Requirements

- **Components**: 90%+ line coverage
- **Hooks**: 95%+ line coverage  
- **Services**: 90%+ line coverage
- **Utilities**: 95%+ line coverage
- **Overall**: 85%+ line coverage

## Test Configuration

### Vitest Config
Tests are configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

### Global Setup
The `setup.ts` file configures:
- Jest DOM matchers
- MSW server lifecycle
- Global mocks (IntersectionObserver, ResizeObserver, matchMedia)
- Cleanup between tests

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what users see and do
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test Accessibility**: Include ARIA attributes and keyboard navigation
4. **Mock External Dependencies**: Use MSW for API calls, mock complex dependencies
5. **Keep Tests Isolated**: Each test should be independent
6. **Use Descriptive Names**: Test names should clearly describe what is being tested
7. **Test Error States**: Include tests for loading, error, and empty states
8. **Async Testing**: Use `waitFor` and `findBy` queries for async operations
9. **User-Centric Testing**: Test from the user's perspective
10. **Consistent Mock Data**: Use factory functions for test data

## Debugging Tests

```bash
# Run tests with debug output
npm test -- --reporter=verbose

# Run single test file with debugging
npm test -- JobCard.test.tsx --reporter=verbose

# Use test UI for interactive debugging
npm run test:ui

# Run tests with coverage and open report
npm run test:coverage && open coverage/index.html
```

## Continuous Integration

Tests are configured for CI with:
- Parallel execution for faster runs
- Coverage reporting and thresholds
- Retry on failure for flaky tests
- Performance monitoring
- Accessibility compliance checks

The full test suite should complete in under 2 minutes.