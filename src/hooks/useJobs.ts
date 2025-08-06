import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, JobListOptions } from '../services/jobService';
import { Job, CreateJobRequest, JobStatus } from '../types';
import { queryKeys, pollingIntervals } from '../lib/queryClient';

/**
 * Hook for fetching paginated job list with real-time updates
 */
export function useJobs(options: JobListOptions = {}) {
  return useQuery({
    queryKey: queryKeys.jobsList(options),
    queryFn: () => jobService.getJobs(options),
    // Poll for updates every 10 seconds
    refetchInterval: pollingIntervals.jobsList,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for fetching job statistics
 */
export function useJobStats() {
  return useQuery({
    queryKey: queryKeys.jobStats,
    queryFn: () => jobService.getJobStats(),
    // Refetch stats every 30 seconds
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook for creating a new job with optimistic updates
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData: CreateJobRequest) => jobService.createJob(jobData),
    onMutate: async (newJob) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs });

      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(queryKeys.jobsList());

      // Optimistically update the job list
      if (previousJobs) {
        const optimisticJob: Job = {
          job_id: `temp-${Date.now()}`,
          status: JobStatus.PENDING,
          url: newJob.url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          job_metadata: newJob.job_metadata,
        };

        queryClient.setQueryData(queryKeys.jobsList(), (old: any) => ({
          ...old,
          jobs: [optimisticJob, ...(old?.jobs || [])],
          total: (old?.total || 0) + 1,
        }));
      }

      return { previousJobs };
    },
    onError: (_error, _newJob, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(queryKeys.jobsList(), context.previousJobs);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch job list to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      
      // Set the individual job data
      queryClient.setQueryData(queryKeys.job(data.job_id), data);
    },
  });
}

/**
 * Hook for canceling a job
 */
export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobService.cancelJob(jobId),
    onMutate: async (jobId) => {
      // Cancel queries for this job
      await queryClient.cancelQueries({ queryKey: queryKeys.job(jobId) });

      // Optimistically update job status
      queryClient.setQueryData(queryKeys.job(jobId), (old: Job | undefined) => 
        old ? { ...old, status: JobStatus.CANCELLED } : old
      );

      // Update job in the list
      queryClient.setQueriesData(
        { queryKey: queryKeys.jobs },
        (old: any) => {
          if (!old?.jobs) return old;
          return {
            ...old,
            jobs: old.jobs.map((job: Job) =>
              job.job_id === jobId ? { ...job, status: JobStatus.CANCELLED } : job
            ),
          };
        }
      );
    },
    onSuccess: (_, jobId) => {
      // Refetch the specific job and job list
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

/**
 * Hook for retrying a failed job
 */
export function useRetryJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobService.retryJob(jobId),
    onSuccess: (newJob) => {
      // Add the new job to the cache
      queryClient.setQueryData(queryKeys.job(newJob.job_id), newJob);
      
      // Invalidate job list to show the new retry job
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

/**
 * Hook for cloning a job
 */
export function useCloneJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobService.cloneJob(jobId),
    onSuccess: (newJob) => {
      // Add the new job to the cache
      queryClient.setQueryData(queryKeys.job(newJob.job_id), newJob);
      
      // Invalidate job list to show the new cloned job
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

/**
 * Hook for getting recent jobs (last 24 hours)
 */
export function useRecentJobs(limit: number = 50) {
  return useQuery({
    queryKey: ['jobs', 'recent', limit],
    queryFn: () => jobService.getRecentJobs(limit),
    // Refetch recent jobs every 15 seconds
    refetchInterval: 15 * 1000,
  });
}

/**
 * Hook for getting jobs by status with real-time updates
 */
export function useJobsByStatus(status: JobStatus, limit?: number) {
  return useQuery({
    queryKey: ['jobs', 'by-status', status, limit],
    queryFn: () => jobService.getJobsByStatus(status, limit),
    // Poll more frequently for active statuses
    refetchInterval: 
      status === JobStatus.PENDING || status === JobStatus.IN_PROGRESS 
        ? pollingIntervals.activeJobs 
        : pollingIntervals.jobsList,
  });
}

/**
 * Hook for checking if a job exists
 */
export function useJobExists(jobId: string) {
  return useQuery({
    queryKey: ['jobs', 'exists', jobId],
    queryFn: () => jobService.jobExists(jobId),
    enabled: !!jobId,
    // Cache existence checks for 1 minute
    staleTime: 60 * 1000,
  });
}