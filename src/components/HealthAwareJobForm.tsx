import React from 'react';
import { Link } from 'react-router-dom';
import { useHealthStatus } from '../hooks';
import { JobForm } from './forms';
import { LoadingSpinner, HealthIndicator, RetryButton } from './';

interface HealthAwareJobFormProps {
  onSuccess?: (jobId: string) => void;
  className?: string;
}

const HealthAwareJobForm: React.FC<HealthAwareJobFormProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const { 
    status, 
    isHealthy, 
    isDegraded, 
    isLoading, 
    error, 
    canCreateJobs, 
    shouldShowWarning 
  } = useHealthStatus();

  // Show loading state while checking health
  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Checking API availability...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if health check failed
  if (error && !isHealthy) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              API Unavailable
            </h3>
            
            <p className="text-gray-600 mb-4">
              Unable to connect to the scraping API. Job creation is currently disabled.
            </p>
            
            <div className="text-sm text-red-600 mb-6">
              Error: {error.message}
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <RetryButton 
                onRetry={() => window.location.reload()} 
                text="Retry Connection"
              />
              
              <Link
                to="/health"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View System Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show warning for degraded performance but still allow job creation
  if (shouldShowWarning && canCreateJobs) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                System Performance Warning
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Some system components are experiencing issues. Job creation is still available, 
                  but you may experience slower response times or intermittent failures.
                </p>
              </div>
              <div className="mt-3 flex items-center space-x-4">
                <HealthIndicator size="sm" />
                <Link
                  to="/health"
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  View detailed status →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Job Form */}
        <JobForm onSuccess={onSuccess} className={className} />
      </div>
    );
  }

  // Show disabled state if API is unhealthy and can't create jobs
  if (!canCreateJobs) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Job Creation Disabled
            </h3>
            
            <p className="text-gray-600 mb-4">
              New job creation is currently disabled due to system health issues. 
              Please wait for the system to recover or contact support if the issue persists.
            </p>
            
            <div className="mb-6">
              <HealthIndicator size="lg" showDetails />
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <RetryButton 
                onRetry={() => window.location.reload()} 
                text="Check Again"
              />
              
              <Link
                to="/health"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                System Status
              </Link>
              
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Existing Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal state - show the job form
  return <JobForm onSuccess={onSuccess} className={className} />;
};

export default HealthAwareJobForm;