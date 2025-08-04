import { CreateJobRequest, ValidationError } from '../types';

/**
 * Validates a job creation request
 */
export const validateJobRequest = (jobData: CreateJobRequest): void => {
  if (!jobData.url) {
    throw new ValidationError('URL is required', 'url');
  }

  if (!isValidUrl(jobData.url)) {
    throw new ValidationError('Invalid URL format', 'url');
  }

  if (jobData.timeout && (jobData.timeout < 1 || jobData.timeout > 300)) {
    throw new ValidationError('Timeout must be between 1 and 300 seconds', 'timeout');
  }

  if (jobData.selectors) {
    for (const [key, selector] of Object.entries(jobData.selectors)) {
      if (!selector.trim()) {
        throw new ValidationError(`Selector for "${key}" cannot be empty`, 'selectors');
      }
    }
  }
};

/**
 * Validates URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates CSS selector syntax
 */
export const isValidSelector = (selector: string): boolean => {
  try {
    // Create a temporary element to test the selector
    const testElement = document.createElement('div');
    testElement.querySelector(selector);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates job metadata
 */
export const validateJobMetadata = (metadata: Record<string, unknown>): void => {
  if (typeof metadata !== 'object' || metadata === null) {
    throw new ValidationError('Job metadata must be an object', 'job_metadata');
  }

  // Check for circular references
  try {
    JSON.stringify(metadata);
  } catch {
    throw new ValidationError('Job metadata contains circular references', 'job_metadata');
  }
};