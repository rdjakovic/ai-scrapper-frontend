import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration with proper caching and retry strategies
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.statusCode >= 400 && error?.statusCode < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
      // Refetch when coming back online
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
  // Health queries
  health: ['health'] as const,
  
  // Job queries
  jobs: ['jobs'] as const,
  jobsList: (filters?: any) => ['jobs', 'list', filters] as const,
  job: (jobId: string) => ['jobs', 'detail', jobId] as const,
  jobStats: ['jobs', 'stats'] as const,
  
  // Results queries
  results: ['results'] as const,
  jobResults: (jobId: string, options?: any) => 
    ['results', jobId, options] as const,
} as const;

/**
 * Polling intervals for different types of data
 */
export const pollingIntervals = {
  // Health check every 30 seconds
  health: 30 * 1000,
  // Job status updates every 5 seconds for active jobs
  activeJobs: 5 * 1000,
  // Job list updates every 10 seconds
  jobsList: 10 * 1000,
  // Results polling every 3 seconds for pending results
  pendingResults: 3 * 1000,
} as const;