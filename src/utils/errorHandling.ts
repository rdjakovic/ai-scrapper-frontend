import { AxiosError } from 'axios';
import { ApiClientError, NetworkError, ApiError } from '../types';

/**
 * Handles API errors and converts them to appropriate error types
 */
export const handleApiError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    // Network or connection error
    if (!error.response) {
      return new NetworkError(
        'Network error: Unable to connect to the API server',
        error
      );
    }

    // HTTP error with response
    const { status, data } = error.response;
    const apiError = data as ApiError;
    
    const message = apiError?.detail || error.message || 'An API error occurred';
    
    return new ApiClientError(message, status, data);
  }

  // Generic error fallback
  if (error instanceof Error) {
    return error;
  }

  // Unknown error type
  return new Error('An unknown error occurred');
};

/**
 * Checks if an error is a network connectivity issue
 */
export const isNetworkError = (error: Error): boolean => {
  return error instanceof NetworkError || 
         (error instanceof ApiClientError && !error.statusCode);
};

/**
 * Checks if an error is a client-side validation error
 */
export const isValidationError = (error: Error): boolean => {
  return error instanceof ApiClientError && 
         error.statusCode !== undefined && 
         error.statusCode >= 400 && 
         error.statusCode < 500;
};

/**
 * Checks if an error is a server-side error
 */
export const isServerError = (error: Error): boolean => {
  return error instanceof ApiClientError && 
         error.statusCode !== undefined && 
         error.statusCode >= 500;
};

/**
 * Extracts a user-friendly error message from any error
 */
export const getErrorMessage = (error: Error): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred';
};

/**
 * Determines if an operation should be retried based on the error
 */
export const shouldRetry = (error: Error, attemptCount: number, maxAttempts: number = 3): boolean => {
  if (attemptCount >= maxAttempts) {
    return false;
  }

  // Retry network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Retry server errors (5xx)
  if (isServerError(error)) {
    return true;
  }

  // Don't retry client errors (4xx)
  return false;
};

/**
 * Creates a standardized error response for the UI
 */
export const createErrorResponse = (error: Error): {
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  retryable: boolean;
  statusCode?: number;
} => {
  if (isNetworkError(error)) {
    return {
      message: getErrorMessage(error),
      type: 'network',
      retryable: true
    };
  }

  if (isValidationError(error)) {
    return {
      message: getErrorMessage(error),
      type: 'validation',
      retryable: false,
      statusCode: (error as ApiClientError).statusCode
    };
  }

  if (isServerError(error)) {
    return {
      message: getErrorMessage(error),
      type: 'server',
      retryable: true,
      statusCode: (error as ApiClientError).statusCode
    };
  }

  return {
    message: getErrorMessage(error),
    type: 'unknown',
    retryable: false
  };
};

/**
 * Logs errors with appropriate level based on error type
 */
export const logError = (error: Error, context?: string): void => {
  const errorInfo = createErrorResponse(error);
  const logMessage = context ? `[${context}] ${errorInfo.message}` : errorInfo.message;
  
  if (errorInfo.type === 'network') {
    console.warn('Network Error:', logMessage, error);
  } else if (errorInfo.type === 'validation') {
    console.info('Validation Error:', logMessage, error);
  } else if (errorInfo.type === 'server') {
    console.error('Server Error:', logMessage, error);
  } else {
    console.error('Unknown Error:', logMessage, error);
  }
};

/**
 * Wraps async operations with error handling and logging
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const handledError = handleApiError(error);
    logError(handledError, context);
    throw handledError;
  }
};