# Testing Setup

This directory contains the testing configuration and utilities for the frontend application.

## Testing Stack

- **Vitest**: Fast unit test framework with Vite integration
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for testing
- **MSW (Mock Service Worker)**: API mocking for tests
- **@testing-library/user-event**: User interaction simulation

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## File Structure

```
src/test/
├── setup.ts              # Test setup and global configuration
├── utils.tsx              # Custom render function and test utilities
├── mocks/
│   ├── server.ts          # MSW server setup
│   └── handlers.ts        # API mock handlers
└── README.md              # This file
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('works correctly', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.doSomething()
    })
    
    expect(result.current.value).toBe('expected')
  })
})
```

### Utility Tests

```typescript
import { describe, it, expect } from 'vitest'
import { myUtilFunction } from '../myUtils'

describe('myUtilFunction', () => {
  it('returns expected result', () => {
    expect(myUtilFunction('input')).toBe('output')
  })
})
```

## Mock Data

Use the factory functions in `utils.tsx` to create consistent test data:

```typescript
import { createMockJob, createMockPendingJob } from '../../test/utils'

const job = createMockJob({ url: 'https://custom.com' })
const pendingJob = createMockPendingJob()
```

## API Mocking

API calls are automatically mocked using MSW. Add new handlers in `mocks/handlers.ts`:

```typescript
http.get('/api/new-endpoint', () => {
  return HttpResponse.json({ data: 'mock response' })
})
```

## Coverage

Coverage reports are generated in the `coverage/` directory. The configuration excludes:
- `node_modules/`
- Test files
- Configuration files
- Type definitions

## Best Practices

1. **Use the custom render function** from `test/utils.tsx` to include providers
2. **Test user interactions** with `@testing-library/user-event`
3. **Mock external dependencies** appropriately
4. **Focus on behavior** rather than implementation details
5. **Use descriptive test names** that explain what is being tested
6. **Group related tests** with `describe` blocks
7. **Clean up after tests** (handled automatically by the setup)