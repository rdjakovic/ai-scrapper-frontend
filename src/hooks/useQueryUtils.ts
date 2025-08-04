import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '../lib/queryClient';
import { Job, JobResult, HealthStatus } from '../types';

/**
 * Hook providing utilities for query cache management and optimistic updates
 */
export function useQueryUtils() {
  const queryClient = useQueryClient();

  /**
   * Invalidate all queries of a specific type
   */
  const invalidateQueries = useCallback((queryKey: readonly unknown[]) => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  /**
   * Invalidate all job-related queries
   */
  const invalidateAllJobs = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
  }, [queryClient]);

  /**
   * Invalidate health queries
   */
  const invalidateHealth = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.health });
  }, [queryClient]);

  /**
   * Update job in cache optimistically
   */
  const updateJobInCache = useCallback((jobId: string, updater: (oldJob: Job | undefined) => Job) => {
    queryClient.setQueryData(queryKeys.job(jobId), updater);
    
    // Also update the job in any job lists
    queryClient.setQueriesData(
      { queryKey: queryKeys.jobs },
      (oldData: any) => {
        if (!oldData?.jobs) return oldData;
        
        return {
          ...oldData,
          jobs: oldData.jobs.map((job: Job) => 
            job.job_id === jobId ? updater(job) : job
          ),
        };
      }
    );
  }, [queryClient]);

  /**
   * Add new job to cache optimistically
   */
  const addJobToCache = useCallback((newJob: Job) => {
    // Add to individual job cache
    queryClient.setQueryData(queryKeys.job(newJob.job_id), newJob);
    
    // Add to job lists
    queryClient.setQueriesData(
      { queryKey: queryKeys.jobs },
      (oldData: any) => {
        if (!oldData) return { jobs: [newJob], total: 1, limit: 50, offset: 0 };
        
        return {
          ...oldData,
          jobs: [newJob, ...(oldData.jobs || [])],
          total: (oldData.total || 0) + 1,
        };
      }
    );
  }, [queryClient]);

  /**
   * Remove job from cache
   */
  const removeJobFromCache = useCallback((jobId: string) => {
    // Remove from individual job cache
    queryClient.removeQueries({ queryKey: queryKeys.job(jobId) });
    
    // Remove from job lists
    queryClient.setQueriesData(
      { queryKey: queryKeys.jobs },
      (oldData: any) => {
        if (!oldData?.jobs) return oldData;
        
        return {
          ...oldData,
          jobs: oldData.jobs.filter((job: Job) => job.job_id !== jobId),
          total: Math.max(0, (oldData.total || 0) - 1),
        };
      }
    );
  }, [queryClient]);

  /**
   * Update health status in cache
   */
  const updateHealthInCache = useCallback((health: HealthStatus) => {
    queryClient.setQueryData(queryKeys.health, health);
  }, [queryClient]);

  /**
   * Set results in cache
   */
  const setResultsInCache = useCallback((jobId: string, results: JobResult) => {
    queryClient.setQueryData(queryKeys.jobResults(jobId), results);
  }, [queryClient]);

  /**
   * Prefetch data for better UX
   */
  const prefetchJob = useCallback((jobId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.job(jobId),
      queryFn: () => import('../services/jobService').then(({ jobService }) => jobService.getJob(jobId)),
    });
  }, [queryClient]);

  /**
   * Prefetch results
   */
  const prefetchResults = useCallback((jobId: string, options?: { includeHtml?: boolean; includeScreenshot?: boolean }) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.jobResults(jobId, options),
      queryFn: () => import('../services/resultsService').then(({ resultsService }) => 
        resultsService.getResults(jobId, options)
      ),
    });
  }, [queryClient]);

  /**
   * Get cached data without triggering a fetch
   */
  const getCachedJob = useCallback((jobId: string): Job | undefined => {
    return queryClient.getQueryData(queryKeys.job(jobId));
  }, [queryClient]);

  /**
   * Get cached results without triggering a fetch
   */
  const getCachedResults = useCallback((jobId: string): JobResult | undefined => {
    return queryClient.getQueryData(queryKeys.jobResults(jobId));
  }, [queryClient]);

  /**
   * Get cached health status
   */
  const getCachedHealth = useCallback((): HealthStatus | undefined => {
    return queryClient.getQueryData(queryKeys.health);
  }, [queryClient]);

  /**
   * Clear all cached data
   */
  const clearAllCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  /**
   * Get query cache statistics
   */
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
    };
  }, [queryClient]);

  return {
    // Invalidation
    invalidateQueries,
    invalidateAllJobs,
    invalidateHealth,
    
    // Cache updates
    updateJobInCache,
    addJobToCache,
    removeJobFromCache,
    updateHealthInCache,
    setResultsInCache,
    
    // Prefetching
    prefetchJob,
    prefetchResults,
    
    // Cache reading
    getCachedJob,
    getCachedResults,
    getCachedHealth,
    
    // Cache management
    clearAllCache,
    getCacheStats,
  };
}