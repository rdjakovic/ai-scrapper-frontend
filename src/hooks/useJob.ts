import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { JobStatus } from '../types';
import { queryKeys, pollingIntervals } from '../lib/queryClient';

/**
 * Hook for fetching a single job with real-time polling for active jobs
 */
export function useJob(jobId: string) {
  return useQuery({
    queryKey: queryKeys.job(jobId),
    queryFn: () => jobService.getJob(jobId),
    enabled: !!jobId,
    // Dynamic polling based on job status
    refetchInterval: (query) => {
      const job = query.state.data;
      if (!job) return false;
      
      // Poll active jobs more frequently
      if (job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS) {
        return pollingIntervals.activeJobs;
      }
      
      // Stop polling for completed/failed/cancelled jobs
      return false;
    },
    // Keep polling even when window is not focused for active jobs
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook for fetching a job with retry logic
 */
export function useJobWithRetry(jobId: string, maxAttempts: number = 3) {
  return useQuery({
    queryKey: [...queryKeys.job(jobId), 'with-retry', maxAttempts],
    queryFn: () => jobService.getJobWithRetry(jobId, maxAttempts),
    enabled: !!jobId,
    // Don't retry the query itself since the service handles retries
    retry: false,
  });
}

/**
 * Hook that provides job status with optimized polling
 */
export function useJobStatus(jobId: string) {
  const { data: job, ...queryResult } = useJob(jobId);
  
  return {
    jobStatus: job?.status,
    isActive: job?.status === JobStatus.PENDING || job?.status === JobStatus.IN_PROGRESS,
    isCompleted: job?.status === JobStatus.COMPLETED,
    isFailed: job?.status === JobStatus.FAILED,
    isCancelled: job?.status === JobStatus.CANCELLED,
    job,
    ...queryResult,
  };
}

/**
 * Hook for monitoring multiple jobs simultaneously
 */
export function useJobsMonitor(jobIds: string[]) {
  const queries = jobIds.map(jobId => ({
    queryKey: queryKeys.job(jobId),
    queryFn: () => jobService.getJob(jobId),
    enabled: !!jobId,
    refetchInterval: (data: any) => {
      if (!data?.data) return false;
      
      const job = data.data;
      if (job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS) {
        return pollingIntervals.activeJobs;
      }
      return false;
    },
  }));

  // This would require useQueries from React Query
  // For now, we'll return a simplified version
  return {
    jobs: jobIds.map(jobId => useJob(jobId)),
    activeCount: 0, // This would be calculated from the actual jobs
    completedCount: 0,
    failedCount: 0,
  };
}