// Job Status Enum
export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Job Creation Request
export interface CreateJobRequest {
  url: string;
  selectors?: Record<string, string>;
  wait_for?: string;
  timeout?: number;
  javascript?: boolean;
  user_agent?: string;
  headers?: Record<string, string>;
  job_metadata?: Record<string, unknown>;
}

// Job Response
export interface Job {
  job_id: string;
  status: JobStatus;
  url: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  job_metadata?: Record<string, unknown>;
}

// Job Results
export interface JobResult {
  job_id: string;
  url: string;
  status: JobStatus;
  data?: Record<string, unknown>;
  raw_html?: string;
  screenshot?: string;
  scraped_at?: string;
  processing_time?: number;
  error_message?: string;
}

// Health Check
export interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  redis: string;
  version: string;
  uptime: number;
}

// API Error Response
export interface ApiError {
  detail: string;
  status_code: number;
  timestamp: string;
}

// Custom Error Types
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// Environment Configuration
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
}

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}
