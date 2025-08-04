import { useQueryClient } from '@tanstack/react-query';
import { useJobs, useCreateJob, useCancelJob, useRetryJob } from './useJobs';
import { useJob } from './useJob';
import { useResults, usePrefetchResults } from './useResults';
import { useHealthStatus } from './useHealth';
import { JobStatus, CreateJobRequest } from '../types';
import { queryKeys } from '../lib/queryClient';
import { useCallback, useEffect } from 'react';

/**
 * Comprehensive hook for job management with optimistic updates and real-time features
 */
export function useJobManagement() {
  const queryClient = useQueryClient();
  const { canCreateJobs } = useHealthStatus();
  const { prefetchResults } = usePrefetchResults();
  
  const createJobMutation = useCreateJob();
  const cancelJobMutation = useCancelJob();
  const retryJobMutation = useRetryJob();

  /**
   * Create a new job with optimistic updates and result prefetching
   */
  const createJob = useCallback(async (jobData: CreateJobRequest) => {
    if (!canCreateJobs) {
      throw new Error('API is not ready to accept new jobs');
    }

    try {
      const newJob = await createJobMutation.mutateAsync(jobData);
      
      // Prefetch results for the new job (they won't be available yet, but this sets up the cache)
      prefetchResults(newJob.job_id);
      
      return newJob;
    } catch (error) {
      throw error;
    }
  }, [canCreateJobs, createJobMutation, prefetchResults]);

  /**
   * Cancel a job with optimistic updates
   */
  const cancelJob = useCallback(async (jobId: string) => {
    try {
      await cancelJobMutation.mutateAsync(jobId);
    } catch (error) {
      throw error;
    }
  }, [cancelJobMutation]);

  /**
   * Retry a failed job
   */
  const retryJob = useCallback(async (jobId: string) => {
    try {
      const newJob = await retryJobMutation.mutateAsync(jobId);
      
      // Prefetch results for the retry job
      prefetchResults(newJob.job_id);
      
      return newJob;
    } catch (error) {
      throw error;
    }
  }, [retryJobMutation, prefetchResults]);

  /**
   * Invalidate all job-related queries (useful for manual refresh)
   */
  const refreshAllJobs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
  }, [queryClient]);

  /**
   * Prefetch job details for better UX
   */
  const prefetchJob = useCallback((jobId: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.job(jobId),
      queryFn: () => import('../services/jobService').then(({ jobService }) => jobService.getJob(jobId)),
    });
  }, [queryClient]);

  return {
    // Actions
    createJob,
    cancelJob,
    retryJob,
    refreshAllJobs,
    prefetchJob,
    
    // Mutation states
    isCreating: createJobMutation.isPending,
    isCancelling: cancelJobMutation.isPending,
    isRetrying: retryJobMutation.isPending,
    
    // Errors
    createError: createJobMutation.error,
    cancelError: cancelJobMutation.error,
    retryError: retryJobMutation.error,
    
    // System status
    canCreateJobs,
  };
}

/**
 * Hook for monitoring a specific job with automatic result prefetching
 */
export function useJobMonitor(jobId: string) {
  const { data: job, ...jobQuery } = useJob(jobId);
  const { prefetchResults } = usePrefetchResults();
  
  // Prefetch results when job completes
  useEffect(() => {
    if (job?.status === JobStatus.COMPLETED) {
      prefetchResults(jobId);
    }
  }, [job?.status, jobId, prefetchResults]);

  return {
    job,
    isActive: job?.status === JobStatus.PENDING || job?.status === JobStatus.IN_PROGRESS,
    isCompleted: job?.status === JobStatus.COMPLETED,
    isFailed: job?.status === JobStatus.FAILED,
    isCancelled: job?.status === JobStatus.CANCELLED,
    ...jobQuery,
  };
}

/**
 * Hook for dashboard-style job overview with real-time updates
 */
export function useJobDashboard() {
  const { data: jobsData, ...jobsQuery } = useJobs({ limit: 50, sortBy: 'created_at', sortOrder: 'desc' });
  const { data: stats, ...statsQuery } = useJobs(); // This would need to be implemented in useJobs
  
  const jobs = jobsData?.jobs || [];
  const activeJobs = jobs.filter(job => 
    job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS
  );
  const recentJobs = jobs.slice(0, 10);
  
  return {
    // Job data
    jobs,
    activeJobs,
    recentJobs,
    totalJobs: jobsData?.total || 0,
    
    // Statistics
    activeCount: activeJobs.length,
    completedCount: jobs.filter(job => job.status === JobStatus.COMPLETED).length,
    failedCount: jobs.filter(job => job.status === JobStatus.FAILED).length,
    
    // Query states
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
    isRefetching: jobsQuery.isFetching,
    
    // Actions
    refetch: jobsQuery.refetch,
  };
}

/**
 * Hook for job results with automatic polling for completed jobs
 */
export function useJobResults(jobId: string, jobStatus?: JobStatus) {
  const shouldFetchResults = jobStatus === JobStatus.COMPLETED;
  
  const { data: results, ...resultsQuery } = useResults(jobId, {
    enabled: shouldFetchResults,
  });
  
  return {
    results,
    hasResults: !!results?.data,
    isLoadingResults: resultsQuery.isLoading && shouldFetchResults,
    resultsError: resultsQuery.error,
    ...resultsQuery,
  };
}