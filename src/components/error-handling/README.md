# Error Handling and User Feedback System

This directory contains comprehensive error handling and user feedback components for the Web Scraping UI application.

## Components Overview

### Core Error Handling Components

#### 1. ErrorBoundary
A React error boundary component that catches JavaScript errors anywhere in the child component tree.

**Features:**
- Catches and displays unhandled React errors
- Shows user-friendly error messages
- Provides retry and refresh options
- Development mode shows detailed error information
- Customizable fallback UI

**Usage:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

#### 2. ErrorToast & ToastProvider
A toast notification system for displaying transient error messages and feedback.

**Features:**
- Multiple toast types (error, success, warning, info)
- Auto-dismiss with configurable duration
- Action buttons for interactive toasts
- Portal-based rendering
- Stacking and queue management
- Smooth animations

**Usage:**
```tsx
// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
const { showError, showSuccess } = useToast();
showError('Something went wrong', {
  action: { label: 'Retry', onClick: handleRetry }
});
```

#### 3. RetryButton
A specialized button component for retry operations with built-in loading states.

**Features:**
- Loading state management
- Retry count tracking
- Multiple variants and sizes
- Disabled state handling
- Customizable appearance

**Usage:**
```tsx
<RetryButton
  onRetry={handleRetry}
  maxRetries={3}
  retryCount={currentRetryCount}
  variant="primary"
  size="md"
/>
```

### Form Validation Components

#### 4. FormField
A wrapper component that provides consistent form field styling with error states.

**Features:**
- Label and error message display
- Required field indicators
- Help text support
- Accessibility attributes
- Error state styling

**Usage:**
```tsx
<FormField
  label="Email Address"
  error={errors.email}
  required
  helpText="We'll never share your email"
>
  <input type="email" {...register('email')} />
</FormField>
```

#### 5. ValidationMessage
A component for displaying inline validation messages with appropriate styling.

**Features:**
- Multiple message types (error, warning, success)
- Icon display options
- Consistent styling
- Accessibility support

**Usage:**
```tsx
<ValidationMessage
  message="Password must be at least 8 characters"
  type="error"
/>
```

### Loading State Components

#### 6. LoadingState
A comprehensive loading state component with multiple display options.

**Features:**
- Full screen, overlay, and inline modes
- Customizable messages
- Spinner integration
- Flexible positioning

**Usage:**
```tsx
<LoadingState message="Loading data..." overlay />
<LoadingState message="Processing..." fullScreen />
```

#### 7. SkeletonLoader
Skeleton loading components for better perceived performance.

**Features:**
- Basic skeleton loader
- Predefined skeleton components (Card, Table, List)
- Customizable dimensions
- Smooth animations

**Usage:**
```tsx
<SkeletonLoader width="w-3/4" height="h-4" />
<SkeletonCard />
<SkeletonTable rows={5} columns={3} />
<SkeletonList items={10} />
```

## Hooks

### useErrorHandler
A comprehensive hook for handling errors throughout the application.

**Features:**
- Centralized error handling logic
- Toast integration
- Retry logic with exponential backoff
- Error categorization
- Logging integration

**Usage:**
```tsx
const { handleError, handleAsyncError, createRetryHandler } = useErrorHandler({
  context: 'MyComponent',
  showToast: true
});

// Handle async operations
const result = await handleAsyncError(async () => {
  return await apiCall();
});

// Create retry handler
const retryHandler = createRetryHandler(
  async () => await operation(),
  { maxRetries: 3 }
);
```

### useToast
Hook for accessing the toast notification system.

**Features:**
- Multiple toast types
- Action buttons
- Duration control
- Queue management

**Usage:**
```tsx
const { showError, showSuccess, showWarning, showInfo } = useToast();

showError('Operation failed', {
  duration: 5000,
  action: { label: 'Retry', onClick: handleRetry }
});
```

## Error Types and Handling

### Error Categories

1. **Network Errors**: Connection issues, timeouts
2. **Validation Errors**: Client-side form validation
3. **Server Errors**: API errors (4xx, 5xx)
4. **Unknown Errors**: Unexpected errors

### Error Response Structure

```typescript
interface ErrorResponse {
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  retryable: boolean;
  statusCode?: number;
}
```

## Integration Examples

### Basic Error Boundary Setup

```tsx
// main.tsx
<ErrorBoundary>
  <QueryProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </QueryProvider>
</ErrorBoundary>
```

### Component with Error Handling

```tsx
const MyComponent: React.FC = () => {
  const { handleAsyncError } = useErrorHandler();
  const { showSuccess } = useToast();

  const handleSubmit = async (data: FormData) => {
    const result = await handleAsyncError(
      async () => await submitForm(data),
      {
        onSuccess: () => showSuccess('Form submitted successfully'),
        onError: (error) => console.error('Submit failed:', error)
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form content */}
    </form>
  );
};
```

### Enhanced List Component

```tsx
const EnhancedList: React.FC = () => {
  const { data, isLoading, error } = useQuery(queryKey, queryFn);
  const { handleError } = useErrorHandler();

  if (isLoading) {
    return <SkeletonList items={10} />;
  }

  if (error) {
    const errorResponse = handleError(error);
    return (
      <ErrorMessage
        message={errorResponse.message}
        onRetry={errorResponse.retryable ? refetch : undefined}
      />
    );
  }

  return <div>{/* list content */}</div>;
};
```

## Best Practices

### 1. Error Boundary Placement
- Place error boundaries at strategic points in your component tree
- Use multiple boundaries for better error isolation
- Provide meaningful fallback UIs

### 2. Toast Usage
- Use appropriate toast types for different scenarios
- Keep messages concise and actionable
- Provide retry actions for recoverable errors

### 3. Loading States
- Use skeleton loaders for better perceived performance
- Show loading states for operations > 200ms
- Provide progress indicators for long operations

### 4. Form Validation
- Show validation errors inline
- Use consistent error messaging
- Provide helpful guidance to users

### 5. Retry Logic
- Implement exponential backoff for retries
- Limit retry attempts to prevent infinite loops
- Show retry progress to users

## Accessibility

All components follow WCAG AA guidelines:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## Testing

Components include comprehensive test coverage:
- Unit tests for individual components
- Integration tests for error flows
- Accessibility tests
- Visual regression tests

## Demo

Visit `/demo/error-handling` to see all components in action with interactive examples.