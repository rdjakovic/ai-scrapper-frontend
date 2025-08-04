import React from 'react';
import { Link } from 'react-router-dom';
import { Job, JobStatus } from '../types';
import StatusBadge from './StatusBadge';
import { formatDate, formatRelativeTime, truncateText } from '../utils';
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
    switch (job.status) {
      case JobStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case JobStatus.FAILED:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case JobStatus.IN_PROGRESS:
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case JobStatus.PENDING:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  if (compact) {
    return (
      <Link
        to={`/jobs/${job.job_id}`}
        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
              {formatRelativeTime(job.created_at)}
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {truncateText(job.url, 60)}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Job ID: {job.job_id}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <StatusBadge status={job.status} />
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-900">{formatDate(job.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <span className="ml-2 text-gray-900">{formatRelativeTime(job.updated_at)}</span>
          </div>
          {job.completed_at && (
            <div className="col-span-2">
              <span className="text-gray-500">Completed:</span>
              <span className="ml-2 text-gray-900">{formatDate(job.completed_at)}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {job.error_message && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <span className="font-medium">Error:</span> {job.error_message}
            </p>
          </div>
        )}

        {/* Job Metadata */}
        {job.job_metadata && Object.keys(job.job_metadata).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
            <div className="bg-gray-50 rounded-md p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(job.job_metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex space-x-2">
              {canViewResults && (
                <Link
                  to={`/results/${job.job_id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Results
                </Link>
              )}
              
              {canRetry && onRetry && (
                <button
                  onClick={(e) => handleAction(() => onRetry(job.job_id), e)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Retry
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              {onView && (
                <Link
                  to={`/jobs/${job.job_id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              )}
              
              {canCancel && onCancel && (
                <button
                  onClick={(e) => handleAction(() => onCancel(job.job_id), e)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;