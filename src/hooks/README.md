# React Query Hooks Documentation

This directory contains custom React Query hooks for managing server state in the Web Scraping UI application.

## Overview

The React Query implementation provides:

- **Automatic caching** with configurable stale times
- **Real-time polling** for active jobs and health status
- **Optimistic updates** for better user experience
- **Automatic retry logic** with exponential backoff
- **Background refetching** for real-time data updates
- **Error handling** with proper fallbacks

## Hook Categories

### Health Monitoring Hooks

#### `useHealth()`
Basic health check with automatic polling every 30 seconds.

```typescript
const { data: health, isLoading, error } = useHealth();
```

#### `useHealthStatus()`
Simplified health status with helper methods.

```typescript
const { 
  status,           // 'healthy' | 'degraded' | 'unhealthy'
  isHealthy,        // boolean
  canCreateJobs,    // boolean
  shouldShowWarning // boolean
} = useHealthStatus();
```

#### `useHealthMonitor(config)`
Continuous health monitoring with callbacks.

```typescript
const { 
  isHealthy, 
  lastStatus, 
  startMonitoring, 
  stopMonitoring 
} = useHealthMonitor({
  onHealthChange: (isHealthy, status) => {
    // Handle health changes
  }
});
```

### Job Management Hooks

#### `useJobs(options)`
Fetch paginated job list with real-time updates.

```typescript
const { data: jobsData, isLoading, error } = useJobs({
  status: JobStatus.PENDING,
  limit: 50,
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

#### `useJob(jobId)`
Fetch individual job with dynamic polling based on status.

```typescript
const { data: job, isLoading, error } = useJob(jobId);
// Automatically polls every 5 seconds for active jobs
```

#### `useCreateJob()`
Create new jobs with optimistic updates.

```typescript
const createJobMutation = useCreateJob();

const handleCreateJob = async (jobData) => {
  try {
    const newJob = await createJobMutation.mutateAsync(jobData);
    // Job list is automatically updated optimistically
  } catch (error) {
    // Error handling
  }
};
```

#### `useCancelJob()` / `useRetryJob()`
Job actions with optimistic updates.

```typescript
const cancelJobMutation = useCancelJob();
const retryJobMutation = useRetryJob();

const handleCancel = (jobId) => {
  cancelJobMutation.mutate(jobId);
  // Job status updated optimistically
};
```

### Results Hooks

#### `useResults(jobId, options)`
Fetch job results with optional HTML and screenshots.

```typescript
const { data: results, isLoading } = useResults(jobId, {
  includeHtml: true,
  includeScreenshot: true,
  enabled: jobStatus === JobStatus.COMPLETED
});
```

#### `useResultsPolling(jobId, jobStatus)`
Poll for results until they're available.

```typescript
const { data: results } = useResultsPolling(jobId, jobStatus);
// Polls every 3 seconds until results are ready
```

### Composite Hooks

#### `useJobManagement()`
Comprehensive job management with all actions.

```typescript
const {
  createJob,
  cancelJob,
  retryJob,
  refreshAllJobs,
  isCreating,
  canCreateJobs
} = useJobManagement();
```

#### `useJobDashboard()`
Dashboard-style overview with statistics.

```typescript
const {
  jobs,
  activeJobs,
  totalJobs,
  activeCount,
  completedCount,
  failedCount,
  isLoading
} = useJobDashboard();
```

#### `useJobMonitor(jobId)`
Monitor specific job with automatic result prefetching.

```typescript
const {
  job,
  isActive,
  isCompleted,
  isFailed
} = useJobMonitor(jobId);
```

## Configuration

### Query Client Setup

The query client is configured in `lib/queryClient.ts` with:

- **Stale Time**: 5 minutes for most queries
- **Cache Time**: 10 minutes
- **Retry Logic**: 3 attempts with exponential backoff
- **Background Refetching**: Enabled for real-time updates

### Polling Intervals

Defined in `pollingIntervals`:

- **Health**: 30 seconds
- **Active Jobs**: 5 seconds
- **Job List**: 10 seconds
- **Pending Results**: 3 seconds

### Query Keys

Centralized in `queryKeys` for consistent cache management:

```typescript
queryKeys.health              // ['health']
queryKeys.jobs               // ['jobs']
queryKeys.jobsList(filters)  // ['jobs', 'list', filters]
queryKeys.job(jobId)         // ['jobs', 'detail', jobId]
queryKeys.jobResults(jobId)  // ['results', jobId, options]
```

## Best Practices

### 1. Optimistic Updates

```typescript
const createJobMutation = useCreateJob();

// Optimistic update is handled automatically
const newJob = await createJobMutation.mutateAsync(jobData);
```

### 2. Conditional Queries

```typescript
const { data: results } = useResults(jobId, {
  enabled: jobStatus === JobStatus.COMPLETED
});
```

### 3. Real-time Updates

```typescript
// Jobs automatically poll based on status
const { data: job } = useJob(jobId);
// Active jobs poll every 5 seconds
// Completed jobs stop polling
```

### 4. Error Handling

```typescript
const { data, error, isLoading } = useJobs();

if (error) {
  // Handle error state
}
```

### 5. Cache Management

```typescript
const { invalidateAllJobs, updateJobInCache } = useQueryUtils();

// Manual refresh
invalidateAllJobs();

// Optimistic update
updateJobInCache(jobId, (oldJob) => ({
  ...oldJob,
  status: JobStatus.CANCELLED
}));
```

## Performance Considerations

1. **Background Polling**: Only active jobs and health status poll in background
2. **Conditional Queries**: Results queries only run when jobs are completed
3. **Cache Optimization**: Long cache times for immutable data (results)
4. **Optimistic Updates**: Immediate UI feedback without waiting for server
5. **Query Invalidation**: Targeted invalidation to minimize unnecessary refetches

## Error Handling

The hooks provide comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: Proper error propagation to UI
- **Validation Errors**: Client-side validation before API calls
- **Optimistic Update Rollback**: Automatic rollback on mutation failures

## Testing

Mock the query client for testing:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrap components in test provider
<QueryClientProvider client={createTestQueryClient()}>
  <ComponentUnderTest />
</QueryClientProvider>
```