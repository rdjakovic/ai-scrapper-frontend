import React, { useState } from 'react';
import JobList from '../components/JobList';
import VirtualizedJobList from '../components/VirtualizedJobList';
import { useJobManagement, useJobs } from '../hooks';
import { useToast } from '../providers/ToastProvider';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Link } from 'react-router-dom';
import { PlusIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const Jobs: React.FC = () => {
  const [useVirtualization, setUseVirtualization] = useState(false);
  const { cancelJob, retryJob, canCreateJobs } = useJobManagement();
  const { showSuccess, showError } = useToast();
  const { handleAsyncError } = useErrorHandler({
    context: 'Jobs Page',
    showToast: true
  });

  // Check if we should use virtualization based on job count
  const { data: jobsData } = useJobs({ limit: 1, offset: 0 });
  const shouldUseVirtualization = (jobsData?.total || 0) > 100;

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

        <div className="flex items-center space-x-3">
          {/* View toggle for large datasets */}
          {shouldUseVirtualization && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUseVirtualization(false)}
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  !useVirtualization
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4 mr-1" />
                Grid
              </button>
              <button
                onClick={() => setUseVirtualization(true)}
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  useVirtualization
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="h-4 w-4 mr-1" />
                Virtual
              </button>
            </div>
          )}

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
      </div>

      {shouldUseVirtualization && useVirtualization ? (
        <VirtualizedJobList
          showFilters={true}
          showSearch={true}
          compact={false}
          height={600}
          onJobCancel={handleJobCancel}
          onJobRetry={handleJobRetry}
          onJobView={handleJobView}
        />
      ) : (
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
      )}
    </div>
  );
};

export default Jobs;