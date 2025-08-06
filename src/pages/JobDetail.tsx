import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobMonitor, useJobManagement, useJobResults } from '../hooks';
import { LoadingSpinner, StatusBadge, ErrorMessage } from '../components';
import { JobActions } from '../components/JobActions';
import { JobStatus } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '../providers/ToastProvider';

export function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  
  // Always call hooks at the top level
  const { job, isLoading, error, isActive, isCompleted, isFailed, isCancelled } = useJobMonitor(jobId || '');
  const { results, hasResults, isLoadingResults, resultsError } = useJobResults(jobId || '', job?.status);
  const { cancelJob, retryJob, cloneJob, isCancelling, isRetrying, isCloning, cancelError, retryError, cloneError } = useJobManagement();
  
  if (!jobId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage message="Job ID is required" />
      </div>
    );
  }

  const handleCancel = async () => {
    try {
      await cancelJob(jobId);
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const handleRetry = async () => {
    try {
      const newJob = await retryJob(jobId);
      navigate(`/jobs/${newJob.job_id}`);
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  };

  const handleViewResults = () => {
    navigate(`/results/${jobId}`);
  };

  const handleClone = () => {
    try {
      navigate(`/jobs/${jobId}/clone`);
    } catch (error) {
      showError('Failed to navigate to clone page. Please try again.');
      console.error('Navigation error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-lg text-gray-600">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage 
          message={`Failed to load job details: ${error instanceof Error ? error.message : 'Unknown error occurred'}`}
        />
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage message="Job not found" />
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/jobs')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Jobs
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
          <p className="text-gray-600">Job ID: {job.job_id}</p>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={job.status} />
          {isActive && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Real-time updates active
            </div>
          )}
        </div>
      </div>

      {/* Job Actions */}
      <JobActions
        job={job}
        onCancel={handleCancel}
        onRetry={handleRetry}
        onViewResults={handleViewResults}
        onClone={handleClone}
        isCancelling={isCancelling}
        isRetrying={isRetrying}
        isCloning={isCloning}
        hasResults={hasResults}
        isLoadingResults={isLoadingResults}
        isJobLoading={isLoading}
      />

      {/* Error Messages */}
      {(cancelError || retryError || cloneError) && (
        <div className="space-y-2">
          {cancelError && (
            <ErrorMessage 
              message={`Failed to cancel job: ${cancelError instanceof Error ? cancelError.message : 'Unknown error'}`}
            />
          )}
          {retryError && (
            <ErrorMessage 
              message={`Failed to retry job: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`}
            />
          )}
          {cloneError && (
            <ErrorMessage 
              message={`Failed to clone job: ${cloneError instanceof Error ? cloneError.message : 'Unknown error'}`}
            />
          )}
        </div>
      )}

      {/* Job Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">URL</label>
              <p className="text-sm text-gray-900 break-all">{job.url}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center mt-1">
                <StatusBadge status={job.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm text-gray-900">
                {format(new Date(job.created_at), 'PPpp')}
                <span className="text-gray-500 ml-2">
                  ({formatDistanceToNow(new Date(job.created_at), { addSuffix: true })})
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm text-gray-900">
                {format(new Date(job.updated_at), 'PPpp')}
                <span className="text-gray-500 ml-2">
                  ({formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })})
                </span>
              </p>
            </div>
            {job.completed_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Completed</label>
                <p className="text-sm text-gray-900">
                  {format(new Date(job.completed_at), 'PPpp')}
                  <span className="text-gray-500 ml-2">
                    ({formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })})
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Current Status</label>
              <div className="flex items-center mt-1">
                <StatusBadge status={job.status} />
                <span className="ml-2 text-sm text-gray-600">
                  {getStatusDescription(job.status)}
                </span>
              </div>
            </div>
            
            {isActive && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                  <span className="text-sm text-blue-800 font-medium">
                    Job is currently {job.status === JobStatus.PENDING ? 'pending' : 'in progress'}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Status updates automatically every few seconds
                </p>
              </div>
            )}

            {isFailed && job.error_message && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <label className="text-sm font-medium text-red-800">Error Message</label>
                <p className="text-sm text-red-700 mt-1">{job.error_message}</p>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-800 font-medium">Job completed successfully</span>
                </div>
                {hasResults && (
                  <p className="text-xs text-green-600 mt-1">
                    Results are available for viewing
                  </p>
                )}
              </div>
            )}

            {isCancelled && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">Job was cancelled</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Configuration */}
      {job.job_metadata && Object.keys(job.job_metadata).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Configuration & Metadata</h2>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(job.job_metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Results Preview */}
      {isCompleted && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Results</h2>
            {hasResults && (
              <button
                onClick={handleViewResults}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                View Full Results
              </button>
            )}
          </div>
          
          {isLoadingResults ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Loading results...</span>
            </div>
          ) : resultsError ? (
            <ErrorMessage 
              message={`Failed to load results: ${resultsError instanceof Error ? resultsError.message : 'Unknown error'}`}
            />
          ) : hasResults && results?.data ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-2">Results preview (showing first few items):</p>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify(results.data, null, 2).slice(0, 500)}
                  {JSON.stringify(results.data, null, 2).length > 500 && '...'}
                </pre>
              </div>
              {results.processing_time && (
                <p className="text-sm text-gray-500">
                  Processing time: {results.processing_time}ms
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No results available</p>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusDescription(status: JobStatus): string {
  switch (status) {
    case JobStatus.PENDING:
      return 'Waiting to be processed';
    case JobStatus.IN_PROGRESS:
      return 'Currently being scraped';
    case JobStatus.COMPLETED:
      return 'Successfully completed';
    case JobStatus.FAILED:
      return 'Failed to complete';
    case JobStatus.CANCELLED:
      return 'Cancelled by user';
    default:
      return 'Unknown status';
  }
}