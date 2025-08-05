import { AxiosError } from 'axios';
import { ApiClientError, NetworkError, ApiError } from '../types';

/**
 * Handles API errors and converts them to appropriate error types
 */
export const handleApiError = (error: unknown): any => {
  // Handle axios-like errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    
    if (status >= 400 && status < 500) {
      return {
        type: 'validation',
        message: data?.error || data?.detail || 'Validation error',
        userMessage: data?.error || data?.detail || 'Validation error'
      };
    }
    
    if (status >= 500) {
      return {
        type: 'server',
        message: data?.error || data?.detail || 'Server error',
        userMessage: 'A server error occurred. Please try again later.'
      };
    }
  }
  
  // Handle network errors
  if (error instanceof Error) {
    if (error.name === 'NetworkError' || error.message.includes('Network') || error.message.includes('ERR_NETWORK')) {
      return {
        type: 'network',
        message: error.message,
        userMessage: 'Unable to connect to the server. Please check your internet connection.'
      };
    }
    
    if (error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: error.message,
        userMessage: 'The request timed out. Please try again.'
      };
    }
  }
  
  // Unknown error fallback
  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.'
  };
};

/**
 * Checks if an error is a network connectivity issue
 */
export const isNetworkError = (error: any): boolean => {
  if (error instanceof Error) {
    return error.name === 'NetworkError' || 
           error.message.includes('Network') || 
           error.message.includes('ERR_NETWORK');
  }
  return false;
};

/**
 * Checks if an error is a client-side validation error
 */
export const isValidationError = (error: any): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = error.response?.status;
    return status >= 400 && status < 500;
  }
  return false;
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

/**
 * Formats error messages for display (legacy function for tests)
 */
export const formatErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    return axiosError.response?.data?.message || axiosError.message || 'API error';
  }
  
  return 'An unknown error occurred';
};

/**
 * Creates an error toast notification (legacy function for tests)
 */
export const createErrorToast = (
  message: string, 
  duration: number = 5000, 
  retryAction?: () => void
) => {
  return {
    type: 'error',
    message,
    duration,
    action: retryAction ? {
      label: 'Retry',
      onClick: retryAction
    } : undefined
  };
};