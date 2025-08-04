import React, { useState } from 'react';
import { useToast } from '../providers/ToastProvider';
import { useErrorHandler } from '../hooks/useErrorHandler';
import {
  ErrorBoundary,
  RetryButton,
  ValidationMessage,
  LoadingState,
  SkeletonLoader,
  SkeletonCard,
  FormField
} from '../components';

// Component that can throw errors for testing
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error from the component');
  }
  return <div className="p-4 bg-green-50 border border-green-200 rounded">Component rendered successfully!</div>;
};

const ErrorHandlingDemo: React.FC = () => {
  const [throwError, setThrowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [formValue, setFormValue] = useState('');
  const [formError, setFormError] = useState('');

  const { showError, showSuccess, showWarning, showInfo } = useToast();
  const { handleAsyncError, createRetryHandler } = useErrorHandler({
    context: 'ErrorHandlingDemo'
  });

  const simulateAsyncError = async () => {
    setIsLoading(true);
    try {
      await handleAsyncError(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Simulated async operation failed');
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNetworkError = () => {
    showError('Network connection failed. Please check your internet connection.', {
      action: {
        label: 'Retry',
        onClick: () => showInfo('Retrying connection...')
      }
    });
  };

  const simulateValidationError = () => {
    showWarning('Please fill in all required fields before submitting.');
  };

  const simulateSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  const handleRetryOperation = createRetryHandler(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (Math.random() < 0.7) {
        throw new Error('Operation failed, retrying...');
      }
      showSuccess('Retry operation succeeded!');
    },
    {
      maxRetries: 3,
      onRetry: (attemptCount) => {
        setRetryCount(attemptCount);
      },
      onMaxRetriesReached: () => {
        showError('Maximum retry attempts reached');
      }
    }
  );

  const validateForm = (value: string) => {
    if (!value.trim()) {
      setFormError('This field is required');
    } else if (value.length < 3) {
      setFormError('Must be at least 3 characters long');
    } else {
      setFormError('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Handling Demo</h1>
        <p className="text-gray-600">
          This page demonstrates all the error handling and user feedback components.
        </p>
      </div>

      {/* Toast Notifications */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={simulateSuccess}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Success Toast
          </button>
          <button
            onClick={simulateNetworkError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Error Toast
          </button>
          <button
            onClick={simulateValidationError}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Warning Toast
          </button>
          <button
            onClick={() => showInfo('This is an informational message')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Info Toast
          </button>
        </div>
      </section>

      {/* Error Boundary */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Error Boundary</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setThrowError(!throwError)}
              className={`px-4 py-2 rounded ${
                throwError 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {throwError ? 'Stop Throwing Error' : 'Throw Error'}
            </button>
            <span className="text-sm text-gray-600">
              Toggle to test error boundary behavior
            </span>
          </div>
          
          <ErrorBoundary>
            <ErrorThrowingComponent shouldThrow={throwError} />
          </ErrorBoundary>
        </div>
      </section>

      {/* Retry Button */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Retry Button</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <RetryButton
              onRetry={handleRetryOperation}
              maxRetries={3}
              retryCount={retryCount}
            />
            <span className="text-sm text-gray-600">
              70% chance of failure to demonstrate retry logic
            </span>
          </div>
          
          <div className="flex space-x-4">
            <RetryButton
              onRetry={simulateAsyncError}
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              Small Primary
            </RetryButton>
            <RetryButton
              onRetry={simulateAsyncError}
              variant="outline"
              size="lg"
            >
              Large Outline
            </RetryButton>
          </div>
        </div>
      </section>

      {/* Validation Messages */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Validation Messages</h2>
        <div className="space-y-4">
          <ValidationMessage
            message="This is an error message"
            type="error"
          />
          <ValidationMessage
            message="This is a warning message"
            type="warning"
          />
          <ValidationMessage
            message="This is a success message"
            type="success"
          />
          <ValidationMessage
            message="This message has no icon"
            type="error"
            showIcon={false}
          />
        </div>
      </section>

      {/* Form Field with Validation */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Form Field with Validation</h2>
        <div className="max-w-md">
          <FormField
            label="Sample Input"
            error={formError}
            required
            helpText="Enter at least 3 characters"
          >
            <input
              type="text"
              value={formValue}
              onChange={(e) => {
                setFormValue(e.target.value);
                validateForm(e.target.value);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type something..."
            />
          </FormField>
        </div>
      </section>

      {/* Loading States */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Loading States</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Loading State Component</h3>
            <div className="relative h-32 border border-gray-200 rounded">
              <LoadingState message="Loading data..." overlay />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Skeleton Loaders</h3>
            <div className="space-y-4">
              <SkeletonLoader width="w-3/4" height="h-4" />
              <SkeletonLoader width="w-1/2" height="h-6" />
              <SkeletonLoader width="w-16" height="h-16" rounded />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Skeleton Card</h3>
            <SkeletonCard className="max-w-md" />
          </div>
        </div>
      </section>

      {/* Async Error Handling */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Async Error Handling</h2>
        <div className="space-y-4">
          <button
            onClick={simulateAsyncError}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Simulate Async Error'}
          </button>
          <p className="text-sm text-gray-600">
            This will simulate an async operation that fails and shows error handling
          </p>
        </div>
      </section>
    </div>
  );
};

export default ErrorHandlingDemo;