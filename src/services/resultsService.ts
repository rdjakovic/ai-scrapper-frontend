import { apiClient } from './api';
import { JobResult } from '../types';
import { transformJobResultResponse } from '../utils/responseTransformers';
import { withErrorHandling } from '../utils/errorHandling';

/**
 * Service for job results operations
 */
export class ResultsService {
  private readonly baseEndpoint = '/api/v1/results';

  /**
   * Get job results with optional HTML and screenshot
   */
  async getResults(
    jobId: string, 
    options: {
      includeHtml?: boolean;
      includeScreenshot?: boolean;
    } = {}
  ): Promise<JobResult> {
    return withErrorHandling(async () => {
      const { includeHtml = false, includeScreenshot = false } = options;
      
      const params = new URLSearchParams();
      if (includeHtml) {
        params.append('include_html', 'true');
      }
      if (includeScreenshot) {
        params.append('include_screenshot', 'true');
      }
      
      const queryString = params.toString();
      const endpoint = `${this.baseEndpoint}/${jobId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<any>(endpoint);
      return transformJobResultResponse(response);
    }, 'ResultsService.getResults');
  }

  /**
   * Get results with retry logic for better reliability
   */
  async getResultsWithRetry(
    jobId: string,
    options: {
      includeHtml?: boolean;
      includeScreenshot?: boolean;
      maxAttempts?: number;
    } = {}
  ): Promise<JobResult> {
    const { includeHtml = false, includeScreenshot = false, maxAttempts = 3 } = options;
    
    const params = new URLSearchParams();
    if (includeHtml) {
      params.append('include_html', 'true');
    }
    if (includeScreenshot) {
      params.append('include_screenshot', 'true');
    }
    
    const queryString = params.toString();
    const endpoint = `${this.baseEndpoint}/${jobId}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.requestWithRetry<JobResult>('get', endpoint, undefined, undefined, maxAttempts);
  }

  /**
   * Get only the scraped data without HTML or screenshot
   */
  async getDataOnly(jobId: string): Promise<JobResult> {
    return this.getResults(jobId, { includeHtml: false, includeScreenshot: false });
  }

  /**
   * Get results with HTML content
   */
  async getResultsWithHtml(jobId: string): Promise<JobResult> {
    return this.getResults(jobId, { includeHtml: true, includeScreenshot: false });
  }

  /**
   * Get results with screenshot
   */
  async getResultsWithScreenshot(jobId: string): Promise<JobResult> {
    return this.getResults(jobId, { includeHtml: false, includeScreenshot: true });
  }

  /**
   * Get complete results with both HTML and screenshot
   */
  async getCompleteResults(jobId: string): Promise<JobResult> {
    return this.getResults(jobId, { includeHtml: true, includeScreenshot: true });
  }

  /**
   * Check if results are available for a job
   */
  async hasResults(jobId: string): Promise<boolean> {
    try {
      const result = await this.getDataOnly(jobId);
      return result.status === 'completed' && !!result.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Transform results for export (removes internal fields)
   */
  transformForExport(result: JobResult): Omit<JobResult, 'raw_html' | 'screenshot'> {
    const { raw_html, screenshot, ...exportData } = result;
    return exportData;
  }
}

export const resultsService = new ResultsService();