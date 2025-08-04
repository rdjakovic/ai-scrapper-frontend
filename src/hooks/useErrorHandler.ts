import { useCallback } from 'react';
import { useToast } from '../providers/ToastProvider';
import { 
  handleApiError, 
  createErrorResponse, 
  shouldRetry, 
  logError 
} from '../utils/errorHandling';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logErrors?: boolean;
  context?: string;
}

interface ErrorHandlerResult {
  handleError: (error: unknown, options?: UseErrorHandlerOptions) => {
    message: string;
    type: 'network' | 'validation' | 'server' | 'unknown';
    retryable: boolean;
    statusCode?: number;
  };
  handleAsyncError: <T>(
    operation: () => Promise<T>,
    options?: UseErrorHandlerOptions & {
      onError?: (error: Error) => void;
      onSuccess?: (result: T) => void;
    }
  ) => Promise<T | null>;
  createRetryHandler: (
    operation: () => Promise<void> | void,
    options?: UseErrorHandlerOptions & {
      maxRetries?: number;
      onRetry?: (attemptCount: number) => void;
      onMaxRetriesReached?: () => void;
    }
  ) => (attemptCount?: number) => Promise<void>;
}

export const useErrorHandler = (
  defaultOptions: UseErrorHandlerOptions = {}
): ErrorHandlerResult => {
  const { showError, showWarning } = useToast();

  const handleError = useCallback((
    error: unknown,
    options: UseErrorHandlerOptions = {}
  ) => {
    const opts = { ...defaultOptions, ...options };
    const handledError = handleApiError(error);
    const errorResponse = createErrorResponse(handledError);

    // Log error if enabled
    if (opts.logErrors !== false) {
      logError(handledError, opts.context);
    }

    // Show toast notification if enabled
    if (opts.showToast !== false) {
      if (errorResponse.type === 'network') {
        showError(errorResponse.message, {
          duration: 7000,
          action: errorResponse.retryable ? {
            label: 'Retry',
            onClick: () => window.location.reload()
          } : undefined
        });
      } else if (errorResponse.type === 'server') {
        showError(errorResponse.message, {
          duration: 6000,
          action: {
            label: 'Report Issue',
            onClick: () => {
              // Could integrate with error reporting service
              console.log('Report issue clicked');
            }
          }
        });
      } else if (errorResponse.type === 'validation') {
        showWarning(errorResponse.message, { duration: 5000 });
      } else {
        showError(errorResponse.message);
      }
    }

    return errorResponse;
  }, [defaultOptions, showError, showWarning]);

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    options: UseErrorHandlerOptions & {
      onError?: (error: Error) => void;
      onSuccess?: (result: T) => void;
    } = {}
  ): Promise<T | null> => {
    try {
      const result = await operation();
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (error) {
      const errorResponse = handleError(error, options);
      
      if (options.onError) {
        options.onError(handleApiError(error));
      }
      
      return null;
    }
  }, [handleError]);

  const createRetryHandler = useCallback((
    operation: () => Promise<void> | void,
    options: UseErrorHandlerOptions & {
      maxRetries?: number;
      onRetry?: (attemptCount: number) => void;
      onMaxRetriesReached?: () => void;
    } = {}
  ) => {
    const maxRetries = options.maxRetries || 3;
    
    return async (attemptCount: number = 0): Promise<void> => {
      try {
        await operation();
      } catch (error) {
        const handledError = handleApiError(error);
        const canRetry = shouldRetry(handledError, attemptCount, maxRetries);
        
        if (canRetry) {
          if (options.onRetry) {
            options.onRetry(attemptCount + 1);
          }
          
          // Exponential backoff delay
          const delay = Math.min(1000 * Math.pow(2, attemptCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return createRetryHandler(operation, options)(attemptCount + 1);
        } else {
          if (options.onMaxRetriesReached) {
            options.onMaxRetriesReached();
          }
          
          handleError(error, options);
          throw handledError;
        }
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    createRetryHandler,
  };
};