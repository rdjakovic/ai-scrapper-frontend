import { Job } from '../types';
import { JobFormData } from '../schemas/jobSchema';

/**
 * Maps a Job object to JobFormData for form initialization and editing.
 * This utility function is useful for populating forms when editing existing jobs
 * or for testing purposes.
 * 
 * @param job - The Job object to map
 * @returns Partial<JobFormData> - The mapped form data with only the relevant fields
 */
export function mapJobToFormData(job: Job): Partial<JobFormData> {
  // Extract job_metadata if it exists and convert it to the expected format
  const jobMetadata = job.job_metadata ? 
    Object.entries(job.job_metadata).reduce((acc, [key, value]) => {
      // Ensure the value is of the correct type (string, number, or boolean)
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string | number | boolean>) 
    : undefined;

  return {
    url: job.url,
    // Note: Job doesn't contain form-specific fields like selectors, wait_for, etc.
    // These would need to be retrieved from the original job creation request
    // or stored separately if editing functionality is needed
    job_metadata: jobMetadata && Object.keys(jobMetadata).length > 0 ? jobMetadata : undefined,
  };
}

/**
 * Maps a Job object to JobFormData with additional creation request data.
 * This version accepts optional creation request data to populate form fields
 * that aren't stored in the Job object itself.
 * 
 * @param job - The Job object to map
 * @param creationData - Optional additional data from the original creation request
 * @returns Partial<JobFormData> - The mapped form data
 */
export function mapJobToFormDataWithCreationData(
  job: Job, 
  creationData?: {
    selectors?: Record<string, string>;
    wait_for?: string;
    timeout?: number;
    javascript?: boolean;
    user_agent?: string;
    headers?: Record<string, string>;
  }
): Partial<JobFormData> {
  const baseFormData = mapJobToFormData(job);
  
  if (!creationData) {
    return baseFormData;
  }

  return {
    ...baseFormData,
    selectors: creationData.selectors && Object.keys(creationData.selectors).length > 0 
      ? creationData.selectors 
      : undefined,
    wait_for: creationData.wait_for || undefined,
    timeout: creationData.timeout,
    javascript: creationData.javascript,
    user_agent: creationData.user_agent || undefined,
    headers: creationData.headers && Object.keys(creationData.headers).length > 0 
      ? creationData.headers 
      : undefined,
  };
}
