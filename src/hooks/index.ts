// Export all React Query hooks for easy importing
export * from './useJobs';
export * from './useJob';
export * from './useResults';
export * from './useHealth';
export * from './useJobManagement';
export * from './useQueryUtils';

// Export error handling hooks
export * from './useErrorHandler';

// Re-export React Query utilities that might be useful
export { useQueryClient, useIsFetching, useIsMutating } from '@tanstack/react-query';

// Export query client and keys for advanced usage
export { queryClient, queryKeys, pollingIntervals } from '../lib/queryClient';