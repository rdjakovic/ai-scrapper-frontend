import React from 'react';
import JobList from '../components/JobList';
import { useJobManagement } from '../hooks';
import { useToast } from '../providers/ToastProvider';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

const Jobs: React.FC = () => {
  const { cancelJob, retryJob, canCreateJobs } = useJobManagement();
  const { showSuccess, showError } = useToast();
  const { handleAsyncError } = useErrorHandler({
    context: 'Jobs Page',
    showToast: true
  });

  const handleJobCancel = async (jobId: string) => {
    await handleAsyncError(
      async () => {
        await cancelJob(jobId);
        showSuccess('Job cancelled successfully');
      },
      {
        onError: () => showError('Failed to cancel job. Please try again.')
      }
    );
  };

  const handleJobRetry = async (jobId: string) => {
    await handleAsyncError(
      async () => {
        await retryJob(jobId);
        showSuccess('Job retry initiated successfully');
      },
      {
        onError: () => showError('Failed to retry job. Please try again.')
      }
    );
  };

  const handleJobView = (jobId: string) => {
    // Navigation is handled by the JobCard component
    console.log('Viewing job:', jobId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
          <p className="mt-2 text-gray-600">
            View and manage all your scraping jobs.
          </p>
        </div>

        {canCreateJobs && (
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Job
          </Link>
        )}
      </div>

      <JobList
        showFilters={true}
        showPagination={true}
        showSearch={true}
        compact={false}
        limit={20}
        onJobCancel={handleJobCancel}
        onJobRetry={handleJobRetry}
        onJobView={handleJobView}
      />
    </div>
  );
};

export default Jobs;