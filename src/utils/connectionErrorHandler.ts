import { ApiClientError, NetworkError } from '../types';

/**
 * Connection error types
 */
export enum ConnectionErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Connection error details
 */
export interface ConnectionErrorDetails {
  type: ConnectionErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
  retryAfter?: number; // seconds
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  retryableErrors: ConnectionErrorType[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    ConnectionErrorType.NETWORK_ERROR,
    ConnectionErrorType.TIMEOUT_ERROR,
    ConnectionErrorType.SERVER_ERROR
  ]
};

/**
 * Analyze an error and determine its type and retry characteristics
 */
export function analyzeConnectionError(error: unknown): ConnectionErrorDetails {
  // Network errors (no response received)
  if (error instanceof NetworkError || 
      (error instanceof Error && error.message.includes('Network Error'))) {
    return {
      type: ConnectionErrorType.NETWORK_ERROR,
      message: 'Unable to connect to the API server. Please check your internet connection.',
      originalError: error instanceof Error ? error : undefined,
      retryable: true,
      retryAfter: 5
    };
  }

  // API client errors with status codes
  if (error instanceof ApiClientError) {
    if (error.statusCode && error.statusCode >= 500) {
      return {
        type: ConnectionErrorType.SERVER_ERROR,
        message: 'The API server is experiencing issues. Please try again later.',
        originalError: error,
        statusCode: error.statusCode,
        retryable: true,
        retryAfter: 10
      };
    }

    if (error.statusCode === 408 || error.statusCode === 504) {
      return {
        type: ConnectionErrorType.TIMEOUT_ERROR,
        message: 'The request timed out. The server may be overloaded.',
        originalError: error,
        statusCode: error.statusCode,
        retryable: true,
        retryAfter: 15
      };
    }

    // Client errors (4xx) are generally not retryable
    return {
      type: ConnectionErrorType.UNKNOWN_ERROR,
      message: error.message || 'An API error occurred.',
      originalError: error,
      statusCode: error.statusCode,
      retryable: false
    };
  }

  // Timeout errors
  if (error instanceof Error && 
      (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
    return {
      type: ConnectionErrorType.TIMEOUT_ERROR,
      message: 'The request timed out. Please try again.',
      originalError: error,
      retryable: true,
      retryAfter: 10
    };
  }

  // Generic errors
  return {
    type: ConnectionErrorType.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'An unknown error occurred.',
    originalError: error instanceof Error ? error : undefined,
    retryable: false
  };
}

/**
 * Calculate delay for retry attempt
 */
export function calculateRetryDelay(
  attempt: number, 
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
    config.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return Math.floor(delay + jitter);
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(
  errorDetails: ConnectionErrorDetails,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): boolean {
  return errorDetails.retryable && 
         config.retryableErrors.includes(errorDetails.type);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: ConnectionErrorDetails | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const errorDetails = analyzeConnectionError(error);
      lastError = errorDetails;

      // Don't retry if error is not retryable or we've reached max attempts
      if (!isRetryableError(errorDetails, config) || attempt === config.maxAttempts) {
        throw error;
      }

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error(lastError?.message || 'Maximum retry attempts exceeded');
}

/**
 * Get user-friendly error message for display
 */
export function getErrorDisplayMessage(error: unknown): string {
  const errorDetails = analyzeConnectionError(error);
  return errorDetails.message;
}

/**
 * Get troubleshooting suggestions based on error type
 */
export function getTroubleshootingSuggestions(error: unknown): string[] {
  const errorDetails = analyzeConnectionError(error);
  
  switch (errorDetails.type) {
    case ConnectionErrorType.NETWORK_ERROR:
      return [
        'Check your internet connection',
        'Verify the API server is running',
        'Check if there are any firewall restrictions',
        'Try refreshing the page'
      ];
      
    case ConnectionErrorType.TIMEOUT_ERROR:
      return [
        'The server may be overloaded - try again in a few minutes',
        'Check your internet connection speed',
        'Try reducing the complexity of your request',
        'Contact support if the issue persists'
      ];
      
    case ConnectionErrorType.SERVER_ERROR:
      return [
        'The server is experiencing issues',
        'Try again in a few minutes',
        'Check the system status page',
        'Contact support if the issue persists'
      ];
      
    default:
      return [
        'Try refreshing the page',
        'Check the system status',
        'Contact support if the issue persists'
      ];
  }
}

/**
 * Format retry information for display
 */
export function formatRetryInfo(
  attempt: number, 
  maxAttempts: number, 
  nextRetryIn?: number
): string {
  if (nextRetryIn) {
    return `Attempt ${attempt}/${maxAttempts}. Retrying in ${nextRetryIn} seconds...`;
  }
  return `Attempt ${attempt}/${maxAttempts}`;
}

/**
 * Check if the error indicates the API is completely unavailable
 */
export function isApiUnavailable(error: unknown): boolean {
  const errorDetails = analyzeConnectionError(error);
  return errorDetails.type === ConnectionErrorType.NETWORK_ERROR ||
         (errorDetails.type === ConnectionErrorType.SERVER_ERROR && 
          errorDetails.statusCode && errorDetails.statusCode >= 503);
}