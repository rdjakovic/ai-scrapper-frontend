import React from 'react';
import { Link } from 'react-router-dom';
import { Job, JobStatus } from '../types';
import StatusBadge from './StatusBadge';
import { formatDate, formatRelativeTime, truncateText } from '../utils';
import { createButtonAria, KeyboardNavigation } from '../utils/accessibility';
import { 
  EyeIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface JobCardProps {
  job: Job;
  onCancel?: (jobId: string) => void;
  onRetry?: (jobId: string) => void;
  onView?: (jobId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onCancel,
  onRetry,
  onView,
  showActions = true,
  compact = false
}) => {
  const canCancel = job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS;
  const canRetry = job.status === JobStatus.FAILED;
  const canViewResults = job.status === JobStatus.COMPLETED;

  const getStatusIcon = () => {
    const iconProps = { className: "h-5 w-5", "aria-hidden": true };
    
    switch (job.status) {
      case JobStatus.COMPLETED:
        return <CheckCircleIcon {...iconProps} className="h-5 w-5 text-green-500" />;
      case JobStatus.FAILED:
        return <ExclamationCircleIcon {...iconProps} className="h-5 w-5 text-red-500" />;
      case JobStatus.IN_PROGRESS:
        return <ClockIcon {...iconProps} className="h-5 w-5 text-blue-500 animate-spin" />;
      case JobStatus.PENDING:
        return <ClockIcon {...iconProps} className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon {...iconProps} className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  const handleKeyDown = (action: () => void, event: React.KeyboardEvent) => {
    KeyboardNavigation.handleActivation(event, action);
  };

  if (compact) {
    return (
      <Link
        to={`/jobs/${job.job_id}`}
        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`View job details for ${truncateText(job.url, 50)}, status: ${job.status}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <p className="text-sm font-medium text-gray-900 truncate">
                {truncateText(job.url, 50)}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <time dateTime={job.created_at}>
                {formatRelativeTime(job.created_at)}
              </time>
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <StatusBadge status={job.status} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      aria-labelledby={`job-title-${job.job_id}`}
    >
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <h3 
                id={`job-title-${job.job_id}`}
                className="text-base sm:text-lg font-medium text-gray-900 truncate"
              >
                {truncateText(job.url, compact ? 40 : 60)}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              <span className="sr-only">Job ID: </span>
              <span className="font-mono text-xs">{job.job_id}</span>
            </p>
          </div>
          <div className="ml-0 sm:ml-4 flex-shrink-0">
            <StatusBadge status={job.status} />
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <time 
              dateTime={job.created_at}
              className="ml-2 text-gray-900"
            >
              {formatDate(job.created_at)}
            </time>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <time 
              dateTime={job.updated_at}
              className="ml-2 text-gray-900"
            >
              {formatRelativeTime(job.updated_at)}
            </time>
          </div>
          {job.completed_at && (
            <div className="sm:col-span-2">
              <span className="text-gray-500">Completed:</span>
              <time 
                dateTime={job.completed_at}
                className="ml-2 text-gray-900"
              >
                {formatDate(job.completed_at)}
              </time>
            </div>
          )}
        </div>

        {/* Error Message */}
        {job.error_message && (
          <div 
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm text-red-700">
              <span className="font-medium">Error:</span> {job.error_message}
            </p>
          </div>
        )}

        {/* Job Metadata */}
        {job.job_metadata && Object.keys(job.job_metadata).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
            <div className="bg-gray-50 rounded-md p-3 overflow-x-auto">
              <pre 
                className="text-xs text-gray-600 whitespace-pre-wrap"
                aria-label="Job metadata in JSON format"
              >
                {JSON.stringify(job.job_metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {canViewResults && (
                <Link
                  to={`/results/${job.job_id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  aria-label={`View results for job ${job.job_id}`}
                >
                  <EyeIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">View Results</span>
                  <span className="sm:hidden">Results</span>
                </Link>
              )}
              
              {canRetry && onRetry && (
                <button
                  onClick={(e) => handleAction(() => onRetry(job.job_id), e)}
                  onKeyDown={(e) => handleKeyDown(() => onRetry(job.job_id), e)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  aria-label={`Retry failed job ${job.job_id}`}
                  {...createButtonAria({ describedBy: job.error_message ? `job-error-${job.job_id}` : undefined })}
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  Retry
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {onView && (
                <Link
                  to={`/jobs/${job.job_id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  aria-label={`View detailed information for job ${job.job_id}`}
                >
                  <EyeIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                </Link>
              )}
              
              {canCancel && onCancel && (
                <button
                  onClick={(e) => handleAction(() => onCancel(job.job_id), e)}
                  onKeyDown={(e) => handleKeyDown(() => onCancel(job.job_id), e)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  aria-label={`Cancel running job ${job.job_id}`}
                  {...createButtonAria()}
                >
                  <XMarkIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default JobCard;