import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsService } from '../services/resultsService';
import { JobStatus } from '../types';
import { queryKeys, pollingIntervals } from '../lib/queryClient';

/**
 * Options for fetching job results
 */
interface UseResultsOptions {
  includeHtml?: boolean;
  includeScreenshot?: boolean;
  enabled?: boolean;
}

/**
 * Hook for fetching job results with optional HTML and screenshot
 */
export function useResults(jobId: string, options: UseResultsOptions = {}) {
  const { includeHtml = false, includeScreenshot = false, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.jobResults(jobId, { includeHtml, includeScreenshot }),
    queryFn: () => resultsService.getResults(jobId, { includeHtml, includeScreenshot }),
    enabled: enabled && !!jobId,
    // Don't refetch results once they're loaded (they don't change)
    staleTime: Infinity,
    // Keep results in cache for a long time
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for fetching results with retry logic
 */
export function useResultsWithRetry(
  jobId: string, 
  options: UseResultsOptions & { maxAttempts?: number } = {}
) {
  const { includeHtml = false, includeScreenshot = false, maxAttempts = 3, enabled = true } = options;

  return useQuery({
    queryKey: [...queryKeys.jobResults(jobId, { includeHtml, includeScreenshot }), 'with-retry'],
    queryFn: () => resultsService.getResultsWithRetry(jobId, { 
      includeHtml, 
      includeScreenshot, 
      maxAttempts 
    }),
    enabled: enabled && !!jobId,
    retry: false, // Service handles retries
    staleTime: Infinity,
  });
}

/**
 * Hook for fetching only the scraped data (no HTML or screenshot)
 */
export function useResultsDataOnly(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.jobResults(jobId, { dataOnly: true }),
    queryFn: () => resultsService.getDataOnly(jobId),
    enabled: enabled && !!jobId,
    staleTime: Infinity,
  });
}

/**
 * Hook for fetching results with HTML content
 */
export function useResultsWithHtml(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.jobResults(jobId, { includeHtml: true }),
    queryFn: () => resultsService.getResultsWithHtml(jobId),
    enabled: enabled && !!jobId,
    staleTime: Infinity,
  });
}

/**
 * Hook for fetching results with screenshot
 */
export function useResultsWithScreenshot(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.jobResults(jobId, { includeScreenshot: true }),
    queryFn: () => resultsService.getResultsWithScreenshot(jobId),
    enabled: enabled && !!jobId,
    staleTime: Infinity,
  });
}

/**
 * Hook for fetching complete results (data + HTML + screenshot)
 */
export function useCompleteResults(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.jobResults(jobId, { includeHtml: true, includeScreenshot: true }),
    queryFn: () => resultsService.getCompleteResults(jobId),
    enabled: enabled && !!jobId,
    staleTime: Infinity,
  });
}

/**
 * Hook for checking if results are available
 */
export function useHasResults(jobId: string) {
  return useQuery({
    queryKey: ['results', 'has-results', jobId],
    queryFn: () => resultsService.hasResults(jobId),
    enabled: !!jobId,
    // Check for results every 5 seconds until they're available
    refetchInterval: (query) => {
      // Stop polling once results are available
      return query.state.data ? false : 5000;
    },
  });
}

/**
 * Hook for polling results until they're ready
 * Useful for jobs that just completed
 */
export function useResultsPolling(jobId: string, jobStatus?: JobStatus) {
  const shouldPoll = jobStatus === JobStatus.COMPLETED;
  
  return useQuery({
    queryKey: [...queryKeys.jobResults(jobId), 'polling'],
    queryFn: () => resultsService.getDataOnly(jobId),
    enabled: !!jobId && shouldPoll,
    // Poll every 3 seconds until results are available
    refetchInterval: (query) => {
      const result = query.state.data;
      if (!result?.data) {
        return pollingIntervals.pendingResults;
      }
      return false; // Stop polling once we have data
    },
    // Keep polling in background
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook for transforming results for export
 */
export function useResultsForExport(jobId: string) {
  const { data: results, ...query } = useResultsDataOnly(jobId);
  
  const transformedData = results ? resultsService.transformForExport(results) : null;
  
  return {
    data: transformedData,
    ...query,
  };
}

/**
 * Hook for prefetching results when a job completes
 */
export function usePrefetchResults() {
  const queryClient = useQueryClient();

  return {
    prefetchResults: (jobId: string, options: UseResultsOptions = {}) => {
      return queryClient.prefetchQuery({
        queryKey: queryKeys.jobResults(jobId, options),
        queryFn: () => resultsService.getResults(jobId, options),
        staleTime: Infinity,
      });
    },
    
    prefetchCompleteResults: (jobId: string) => {
      return queryClient.prefetchQuery({
        queryKey: queryKeys.jobResults(jobId, { includeHtml: true, includeScreenshot: true }),
        queryFn: () => resultsService.getCompleteResults(jobId),
        staleTime: Infinity,
      });
    },
  };
}