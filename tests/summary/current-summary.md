# Test Summary Report

*Generated on: 2025-08-06T16:29:54.395Z*

## 📊 Test Statistics

| Metric | Count |
|--------|-------|
| Total Tests | 161 |
| ✅ Passed | 76 |
| ❌ Failed | 85 |
| ⏭️ Skipped | 0 |
| ⏱️ Duration | 21s |

## 🚨 Failing Tests

### 📁 `ErrorMessage.test.tsx`

- ❌ renders error message correctly
- ❌ renders with retry button when onRetry is provided
- ❌ renders without retry button when onRetry is not provided
- ❌ has proper accessibility attributes
- ❌ renders with different variants

### 📁 `JobCard.test.tsx`

- ❌ renders job information correctly
- ❌ shows pending status for pending jobs
- ❌ calls onDelete when delete button is clicked
- ❌ has proper accessibility attributes
- ❌ shows formatted dates

### 📁 `LoadingSpinner.test.tsx`

- ❌ renders with default size
- ❌ renders with custom size
- ❌ renders with custom text
- ❌ has proper accessibility attributes

### 📁 `RetryButton.test.tsx`

- ❌ renders retry button correctly
- ❌ calls onRetry when clicked
- ❌ shows loading state when isLoading is true
- ❌ is disabled when disabled prop is true
- ❌ renders with custom text
- ❌ has proper accessibility attributes

### 📁 `StatusBadge.test.tsx`

- ❌ renders pending status correctly
- ❌ renders completed status correctly
- ❌ renders failed status correctly
- ❌ renders running status correctly
- ❌ has proper accessibility attributes

### 📁 `useErrorHandler.test.tsx`

- ❌ handles errors and provides error state
- ❌ clears error state
- ❌ handles string errors
- ❌ handles axios errors with response
- ❌ handles axios errors without response

### 📁 `userWorkflows.test.tsx`

- ❌ should allow user to create a new scraping job
- ❌ should show validation errors for invalid input
- ❌ should display job list and allow monitoring
- ❌ should allow viewing job details
- ❌ should display job results when available
- ❌ should allow exporting results
- ❌ should handle API errors gracefully
- ❌ should handle network errors
- ❌ should show retry options for failed operations
- ❌ should have proper ARIA labels and roles
- ❌ should support keyboard navigation
- ❌ should handle large datasets efficiently

### 📁 `errorHandling.test.ts`

- ❌ handles network errors
- ❌ formats API error responses
- ❌ logs errors to console
- ❌ logs errors without context
- ❌ handles non-Error objects

### 📁 `exportUtils.test.ts`

- ❌ handles empty jobs array
- ❌ exports jobs to JSON format

### 📁 `validation.test.ts`

- ❌ handles edge cases
- ❌ rejects invalid CSS selectors

### 📁 `JobForm.clone.test.tsx`

- ❌ should successfully clone a job with pre-filled data
- ❌ should allow editing fields before cloning
- ❌ should validate fields before allowing clone
- ❌ should show clone-specific button text and styling
- ❌ should show clone-specific loading states

### 📁 `JobForm.test.tsx`

- ❌ validates required URL field
- ❌ shows loading state during submission

### 📁 `UrlInput.test.tsx`

- ❌ renders input field correctly
- ❌ calls onChange when value changes
- ❌ shows validation error for invalid URL
- ❌ shows valid state for valid URL
- ❌ shows URL preview when enabled
- ❌ has proper accessibility attributes
- ❌ shows aria-invalid when there is an error
- ❌ supports paste event handling

### 📁 `ExportButton.test.tsx`

- ❌ renders export button correctly
- ❌ shows format selection dropdown when clicked
- ❌ exports data as JSON when JSON option is selected
- ❌ exports data as CSV when CSV option is selected
- ❌ shows loading state during export
- ❌ handles export errors gracefully
- ❌ is disabled when no data is provided
- ❌ has proper accessibility attributes
- ❌ supports keyboard navigation

### 📁 `ResultsViewer.test.tsx`

- ❌ renders results data correctly
- ❌ shows different view modes
- ❌ switches between view modes
- ❌ shows export button
- ❌ displays metadata information
- ❌ shows empty state when no data
- ❌ shows screenshot viewer when screenshot is available
- ❌ shows raw HTML viewer when available
- ❌ has proper accessibility attributes
- ❌ handles large datasets with pagination

## ⚠️ React act() Warnings

- **Total warnings:** 329
- **Unique warning types:** 2

### Warning Details

1. React component update warning: JobForm not wrapped in act()

2. React component update warning: UrlInput not wrapped in act()

