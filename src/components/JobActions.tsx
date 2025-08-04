import React from 'react';
import { Job, JobStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface JobActionsProps {
  job: Job;
  onCancel: () => void;
  onRetry: () => void;
  onViewResults: () => void;
  isCancelling: boolean;
  isRetrying: boolean;
  hasResults: boolean;
  isLoadingResults: boolean;
}

export function JobActions({
  job,
  onCancel,
  onRetry,
  onViewResults,
  isCancelling,
  isRetrying,
  hasResults,
  isLoadingResults
}: JobActionsProps) {
  const canCancel = job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS;
  const canRetry = job.status === JobStatus.FAILED || job.status === JobStatus.CANCELLED;
  const canViewResults = job.status === JobStatus.COMPLETED && hasResults;

  if (!canCancel && !canRetry && !canViewResults) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
      <div className="flex flex-wrap gap-3">
        {/* Cancel Button */}
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCancelling ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Job
              </>
            )}
          </button>
        )}

        {/* Retry Button */}
        {canRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRetrying ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Retry...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Job
              </>
            )}
          </button>
        )}

        {/* View Results Button */}
        {job.status === JobStatus.COMPLETED && (
          <button
            onClick={onViewResults}
            disabled={isLoadingResults || !hasResults}
            className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingResults ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading Results...
              </>
            ) : hasResults ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Results
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                No Results Available
              </>
            )}
          </button>
        )}
      </div>

      {/* Action Descriptions */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        {canCancel && (
          <p>• Cancel will stop the job if it's currently running</p>
        )}
        {canRetry && (
          <p>• Retry will create a new job with the same configuration</p>
        )}
        {job.status === JobStatus.COMPLETED && (
          <p>• View results to see the scraped data and export options</p>
        )}
      </div>
    </div>
  );
}