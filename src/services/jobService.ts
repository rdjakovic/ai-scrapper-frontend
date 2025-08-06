import { apiClient } from './api';
import { Job, CreateJobRequest, JobStatus } from '../types';
import { ValidationError } from '../types';
import { transformJobResponse } from '../utils/responseTransformers';
import { withErrorHandling } from '../utils/errorHandling';

/**
 * Interface for job listing options
 */
export interface JobListOptions {
  status?: JobStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for job list response
 */
export interface JobListResponse {
  jobs: Job[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Service for job-related API operations
 */
export class JobService {
  private readonly baseEndpoint = '/api/v1';

  /**
   * Get all jobs with optional filtering and pagination
   */
  async getJobs(options: JobListOptions = {}): Promise<JobListResponse> {
    return withErrorHandling(async () => {
      const params = new URLSearchParams();
      
      if (options.status) {
        params.append('status', options.status);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      if (options.offset) {
        params.append('offset', options.offset.toString());
      }
      if (options.sortBy) {
        params.append('sort_by', options.sortBy);
      }
      if (options.sortOrder) {
        params.append('sort_order', options.sortOrder);
      }

      const queryString = params.toString();
      const endpoint = `${this.baseEndpoint}/jobs${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<any>(endpoint);
      
      // Transform response to ensure consistent structure
      if (Array.isArray(response)) {
        // If response is just an array of jobs
        return {
          jobs: response.map(transformJobResponse),
          total: response.length,
          limit: options.limit || response.length,
          offset: options.offset || 0
        };
      } else {
        // If response has pagination metadata
        return {
          jobs: (response.jobs || response.data || []).map(transformJobResponse),
          total: response.total || response.count || 0,
          limit: response.limit || options.limit || 50,
          offset: response.offset || options.offset || 0
        };
      }
    }, 'JobService.getJobs');
  }

  /**
   * Get jobs with retry logic
   */
  async getJobsWithRetry(options: JobListOptions = {}, maxAttempts: number = 3): Promise<JobListResponse> {
    const params = new URLSearchParams();
    
    if (options.status) {
      params.append('status', options.status);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }
    if (options.sortBy) {
      params.append('sort_by', options.sortBy);
    }
    if (options.sortOrder) {
      params.append('sort_order', options.sortOrder);
    }

    const queryString = params.toString();
    const endpoint = `${this.baseEndpoint}/jobs${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.requestWithRetry<JobListResponse>('get', endpoint, undefined, undefined, maxAttempts);
  }

  /**
   * Get a specific job by ID
   */
  async getJob(jobId: string): Promise<Job> {
    return withErrorHandling(async () => {
      if (!jobId || typeof jobId !== 'string') {
        throw new ValidationError('Job ID is required and must be a string');
      }
      
      const response = await apiClient.get<any>(`${this.baseEndpoint}/scrape/${jobId}`);
      return transformJobResponse(response);
    }, 'JobService.getJob');
  }

  /**
   * Get job with retry logic
   */
  async getJobWithRetry(jobId: string, maxAttempts: number = 3): Promise<Job> {
    if (!jobId || typeof jobId !== 'string') {
      throw new ValidationError('Job ID is required and must be a string');
    }
    
    return apiClient.requestWithRetry<Job>('get', `${this.baseEndpoint}/scrape/${jobId}`, undefined, undefined, maxAttempts);
  }

  /**
   * Create a new scraping job with validation
   */
  async createJob(jobData: CreateJobRequest): Promise<Job> {
    return withErrorHandling(async () => {
      // Validate required fields
      if (!jobData.url) {
        throw new ValidationError('URL is required', 'url');
      }

      // Validate URL format
      try {
        new URL(jobData.url);
      } catch {
        throw new ValidationError('Invalid URL format', 'url');
      }

      // Validate timeout if provided
      if (jobData.timeout && (jobData.timeout < 1 || jobData.timeout > 300)) {
        throw new ValidationError('Timeout must be between 1 and 300 seconds', 'timeout');
      }

      // Transform and clean the request data
      const cleanedJobData = this.transformCreateJobRequest(jobData);
      
      const response = await apiClient.post<any>(`${this.baseEndpoint}/scrape`, cleanedJobData);
      return transformJobResponse(response);
    }, 'JobService.createJob');
  }

  /**
   * Update job metadata (if supported by API)
   */
  async updateJob(jobId: string, updates: Partial<Pick<Job, 'job_metadata'>>): Promise<Job> {
    if (!jobId || typeof jobId !== 'string') {
      throw new ValidationError('Job ID is required and must be a string');
    }
    
    return apiClient.put<Job>(`${this.baseEndpoint}/scrape/${jobId}`, updates);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    if (!jobId || typeof jobId !== 'string') {
      throw new ValidationError('Job ID is required and must be a string');
    }
    
    return apiClient.delete<void>(`${this.baseEndpoint}/scrape/${jobId}`);
  }

  /**
   * Retry a failed job by creating a new job with the same configuration
   */
  async retryJob(jobId: string): Promise<Job> {
    // First get the original job
    const originalJob = await this.getJob(jobId);
    
    // Extract the configuration for retry
    const retryJobData: CreateJobRequest = {
      url: originalJob.url,
      job_metadata: {
        ...originalJob.job_metadata,
        retried_from: jobId,
        retry_timestamp: new Date().toISOString()
      }
    };
    
    return this.createJob(retryJobData);
  }

  /**
   * Clone a job by creating a new job with the same configuration
   */
  async cloneJob(jobId: string): Promise<Job> {
    // First get the original job
    const originalJob = await this.getJob(jobId);
    
    // Extract the configuration for clone
    const cloneJobData: CreateJobRequest = {
      url: originalJob.url,
      job_metadata: {
        ...originalJob.job_metadata,
        cloned_from: jobId,
        clone_timestamp: new Date().toISOString()
      }
    };
    
    return this.createJob(cloneJobData);
  }

  /**
   * Get jobs by status
   */
  async getJobsByStatus(status: JobStatus, limit?: number): Promise<Job[]> {
    const response = await this.getJobs({ status, limit });
    return response.jobs;
  }

  /**
   * Get recent jobs (last 24 hours)
   */
  async getRecentJobs(limit: number = 50): Promise<Job[]> {
    const response = await this.getJobs({ 
      limit, 
      sortBy: 'created_at', 
      sortOrder: 'desc' 
    });
    return response.jobs;
  }

  /**
   * Check if a job exists
   */
  async jobExists(jobId: string): Promise<boolean> {
    try {
      await this.getJob(jobId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<Record<JobStatus, number>> {
    const response = await this.getJobs({ limit: 1000 }); // Get all jobs for stats
    const stats: Record<JobStatus, number> = {
      [JobStatus.PENDING]: 0,
      [JobStatus.IN_PROGRESS]: 0,
      [JobStatus.COMPLETED]: 0,
      [JobStatus.FAILED]: 0,
      [JobStatus.CANCELLED]: 0
    };

    response.jobs.forEach(job => {
      stats[job.status]++;
    });

    return stats;
  }

  /**
   * Transform and clean create job request data
   */
  private transformCreateJobRequest(jobData: CreateJobRequest): CreateJobRequest {
    const cleaned: CreateJobRequest = {
      url: jobData.url.trim(),
    };

    // Only include optional fields if they have meaningful values
    if (jobData.selectors && Object.keys(jobData.selectors).length > 0) {
      cleaned.selectors = jobData.selectors;
    }

    if (jobData.wait_for && jobData.wait_for.trim()) {
      cleaned.wait_for = jobData.wait_for.trim();
    }

    if (jobData.timeout && jobData.timeout > 0) {
      cleaned.timeout = jobData.timeout;
    }

    if (jobData.javascript !== undefined) {
      cleaned.javascript = jobData.javascript;
    }

    if (jobData.user_agent && jobData.user_agent.trim()) {
      cleaned.user_agent = jobData.user_agent.trim();
    }

    if (jobData.headers && Object.keys(jobData.headers).length > 0) {
      cleaned.headers = jobData.headers;
    }

    if (jobData.job_metadata && Object.keys(jobData.job_metadata).length > 0) {
      cleaned.job_metadata = jobData.job_metadata;
    }

    return cleaned;
  }
}

export const jobService = new JobService();