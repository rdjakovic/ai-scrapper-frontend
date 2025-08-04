import React, { useState, useMemo } from 'react';
import { useJobs } from '../hooks';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useToast } from '../providers/ToastProvider';
import JobCard from './JobCard';
import LoadingState from './LoadingState';
import { SkeletonList } from './SkeletonLoader';
import RetryButton from './RetryButton';
import ErrorMessage from './ErrorMessage';
import { JobStatus } from '../types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EnhancedJobListProps {
  showFilters?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  compact?: boolean;
  limit?: number;
  onJobCancel?: (jobId: string) => void;
  onJobRetry?: (jobId: string) => void;
  onJobView?: (jobId: string) => void;
}

const EnhancedJobList: React.FC<EnhancedJobListProps> = ({
  showFilters = true,
  showPagination = true,
  showSearch = true,
  compact = false,
  limit = 20,
  onJobCancel,
  onJobRetry,
  onJobView
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [retryCount, setRetryCount] = useState(0);

  const { showSuccess, showError } = useToast();
  const { handleError, createRetryHandler } = useErrorHandler({
    context: 'JobList',
    showToast: true,
    logErrors: true
  });

  const offset = (currentPage - 1) * limit;

  const { data, isLoading, error, refetch, isError, isPending } = useJobs({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit,
    offset,
    sortBy,
    sortOrder
  });

  // Filter jobs by search query on the client side
  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];
    
    if (!searchQuery.trim()) return data.jobs;
    
    const query = searchQuery.toLowerCase();
    return data.jobs.filter(job => 
      job.url.toLowerCase().includes(query) ||
      job.job_id.toLowerCase().includes(query) ||
      (job.job_metadata && JSON.stringify(job.job_metadata).toLowerCase().includes(query))
    );
  }, [data?.jobs, searchQuery]);

  const totalPages = Math.ceil((data?.total || 0) / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const statusOptions = [
    { value: 'all', label: 'All Status', count: data?.total || 0 },
    { value: JobStatus.PENDING, label: 'Pending', count: 0 },
    { value: JobStatus.IN_PROGRESS, label: 'In Progress', count: 0 },
    { value: JobStatus.COMPLETED, label: 'Completed', count: 0 },
    { value: JobStatus.FAILED, label: 'Failed', count: 0 },
    { value: JobStatus.CANCELLED, label: 'Cancelled', count: 0 }
  ];

  // Enhanced retry handler with exponential backoff
  const handleRetry = createRetryHandler(
    async () => {
      await refetch();
      showSuccess('Jobs refreshed successfully');
    },
    {
      maxRetries: 3,
      onRetry: (attemptCount) => {
        setRetryCount(attemptCount);
        showError(`Retry attempt ${attemptCount}/3...`, { duration: 2000 });
      },
      onMaxRetriesReached: () => {
        showError('Maximum retry attempts reached. Please check your connection and try again later.');
      }
    }
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (status: JobStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (newSortBy: 'created_at' | 'updated_at', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // Enhanced job action handlers with error handling
  const handleJobCancel = async (jobId: string) => {
    try {
      if (onJobCancel) {
        await onJobCancel(jobId);
        showSuccess('Job cancelled successfully');
      }
    } catch (error) {
      handleError(error, { context: 'Cancel Job' });
    }
  };

  const handleJobRetry = async (jobId: string) => {
    try {
      if (onJobRetry) {
        await onJobRetry(jobId);
        showSuccess('Job retry initiated');
      }
    } catch (error) {
      handleError(error, { context: 'Retry Job' });
    }
  };

  // Loading state with skeleton
  if (isPending && !data) {
    return (
      <div className="space-y-6">
        {(showFilters || showSearch) && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        )}
        <SkeletonList items={limit} />
      </div>
    );
  }

  // Error state with enhanced error handling
  if (isError && error) {
    const errorResponse = handleError(error, { showToast: false });
    
    return (
      <div className="space-y-6">
        <ErrorMessage
          message={errorResponse.message}
          onRetry={errorResponse.retryable ? () => handleRetry() : undefined}
          className="bg-red-50 border-red-200"
        />
        
        {errorResponse.type === 'network' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Connection Issues
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Unable to connect to the API server. Please check your internet connection
                    and ensure the API server is running.
                  </p>
                </div>
                <div className="mt-4">
                  <RetryButton
                    onRetry={handleRetry}
                    variant="outline"
                    size="sm"
                    maxRetries={3}
                    retryCount={retryCount}
                  >
                    Retry Connection
                  </RetryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            {showSearch && (
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search jobs by URL, ID, or metadata..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value as JobStatus | 'all')}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Sort by:</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-') as ['created_at' | 'updated_at', 'asc' | 'desc'];
                      handleSortChange(newSortBy, newSortOrder);
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="updated_at-desc">Recently Updated</option>
                    <option value="updated_at-asc">Least Recently Updated</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay for refetching */}
      {isLoading && data && (
        <LoadingState 
          message="Refreshing jobs..." 
          overlay 
          className="relative"
        />
      )}

      {/* Job List */}
      <div className="relative">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FunnelIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first scraping job.'
              }
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={compact ? 'space-y-2' : 'space-y-4'}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onCancel={() => handleJobCancel(job.job_id)}
                onRetry={() => handleJobRetry(job.job_id)}
                onView={onJobView}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{offset + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(offset + limit, data?.total || 0)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{data?.total || 0}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedJobList;