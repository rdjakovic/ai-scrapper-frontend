import { Job, JobResult, HealthStatus, JobStatus } from '../types';

/**
 * Transforms raw API job response to ensure consistent data structure
 */
export const transformJobResponse = (rawJob: any): Job => {
  return {
    job_id: rawJob.job_id || rawJob.id,
    status: rawJob.status as JobStatus,
    url: rawJob.url,
    created_at: rawJob.created_at,
    updated_at: rawJob.updated_at,
    completed_at: rawJob.completed_at || undefined,
    error_message: rawJob.error_message || undefined,
    job_metadata: rawJob.job_metadata || {}
  };
};

/**
 * Transforms raw API job result response
 */
export const transformJobResultResponse = (rawResult: any): JobResult => {
  return {
    job_id: rawResult.job_id || rawResult.id,
    url: rawResult.url,
    status: rawResult.status as JobStatus,
    data: rawResult.data || undefined,
    raw_html: rawResult.raw_html || undefined,
    screenshot: rawResult.screenshot || undefined,
    scraped_at: rawResult.scraped_at || undefined,
    processing_time: rawResult.processing_time || undefined,
    error_message: rawResult.error_message || undefined
  };
};

/**
 * Transforms raw API health response
 */
export const transformHealthResponse = (rawHealth: any): HealthStatus => {
  return {
    status: rawHealth.status,
    timestamp: rawHealth.timestamp,
    database: rawHealth.database || 'unknown',
    redis: rawHealth.redis || 'unknown',
    version: rawHealth.version || 'unknown',
    uptime: rawHealth.uptime || 0
  };
};

/**
 * Formats job data for display purposes
 */
export const formatJobForDisplay = (job: Job): {
  id: string;
  status: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  duration?: string;
  hasError: boolean;
  errorMessage?: string;
} => {
  const createdDate = new Date(job.created_at);
  const updatedDate = new Date(job.updated_at);
  const completedDate = job.completed_at ? new Date(job.completed_at) : undefined;
  
  // Calculate duration if job is completed
  let duration: string | undefined;
  if (completedDate) {
    const durationMs = completedDate.getTime() - createdDate.getTime();
    duration = formatDuration(durationMs);
  }

  return {
    id: job.job_id,
    status: formatJobStatus(job.status),
    url: job.url,
    createdAt: formatDateTime(createdDate),
    updatedAt: formatDateTime(updatedDate),
    completedAt: completedDate ? formatDateTime(completedDate) : undefined,
    duration,
    hasError: !!job.error_message,
    errorMessage: job.error_message
  };
};

/**
 * Formats job result data for display
 */
export const formatJobResultForDisplay = (result: JobResult): {
  id: string;
  url: string;
  status: string;
  hasData: boolean;
  dataCount?: number;
  hasHtml: boolean;
  hasScreenshot: boolean;
  scrapedAt?: string;
  processingTime?: string;
  hasError: boolean;
  errorMessage?: string;
} => {
  const scrapedDate = result.scraped_at ? new Date(result.scraped_at) : undefined;
  
  // Count data items if data is an object or array
  let dataCount: number | undefined;
  if (result.data) {
    if (Array.isArray(result.data)) {
      dataCount = result.data.length;
    } else if (typeof result.data === 'object') {
      dataCount = Object.keys(result.data).length;
    }
  }

  return {
    id: result.job_id,
    url: result.url,
    status: formatJobStatus(result.status),
    hasData: !!result.data,
    dataCount,
    hasHtml: !!result.raw_html,
    hasScreenshot: !!result.screenshot,
    scrapedAt: scrapedDate ? formatDateTime(scrapedDate) : undefined,
    processingTime: result.processing_time ? `${result.processing_time}ms` : undefined,
    hasError: !!result.error_message,
    errorMessage: result.error_message
  };
};

/**
 * Formats health status for display
 */
export const formatHealthForDisplay = (health: HealthStatus): {
  status: string;
  isHealthy: boolean;
  timestamp: string;
  components: {
    database: { status: string; isHealthy: boolean };
    redis: { status: string; isHealthy: boolean };
  };
  version: string;
  uptime: string;
} => {
  const isHealthy = health.status === 'healthy' || health.status === 'ok';
  const isDatabaseHealthy = health.database === 'healthy' || health.database === 'connected' || health.database === 'ok';
  const isRedisHealthy = health.redis === 'healthy' || health.redis === 'connected' || health.redis === 'ok';

  return {
    status: health.status,
    isHealthy,
    timestamp: formatDateTime(new Date(health.timestamp)),
    components: {
      database: {
        status: health.database,
        isHealthy: isDatabaseHealthy
      },
      redis: {
        status: health.redis,
        isHealthy: isRedisHealthy
      }
    },
    version: health.version,
    uptime: formatUptime(health.uptime)
  };
};

/**
 * Helper function to format job status for display
 */
const formatJobStatus = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.PENDING:
      return 'Pending';
    case JobStatus.IN_PROGRESS:
      return 'In Progress';
    case JobStatus.COMPLETED:
      return 'Completed';
    case JobStatus.FAILED:
      return 'Failed';
    case JobStatus.CANCELLED:
      return 'Cancelled';
    default:
      return status;
  }
};

/**
 * Helper function to format date and time
 */
const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Helper function to format duration in milliseconds
 */
const formatDuration = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Helper function to format uptime in seconds
 */
const formatUptime = (uptimeSeconds: number): string => {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Sanitizes data for safe display (removes potentially sensitive information)
 */
export const sanitizeForDisplay = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  
  // Remove potentially sensitive fields
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'auth', 'authorization'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForDisplay(sanitized[key]);
    }
  }

  return sanitized;
};

/**
 * Prepares data for export by removing UI-specific fields
 */
export const prepareForExport = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(prepareForExport);
  }

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const exported = { ...data };
  
  // Remove UI-specific fields
  const uiFields = ['_ui', '_display', '_formatted', '_meta'];
  
  for (const field of uiFields) {
    delete exported[field];
  }

  // Recursively clean nested objects
  for (const key in exported) {
    if (typeof exported[key] === 'object' && exported[key] !== null) {
      exported[key] = prepareForExport(exported[key]);
    }
  }

  return exported;
};