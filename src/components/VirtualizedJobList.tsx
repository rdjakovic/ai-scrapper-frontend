import React, { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useJobs } from '../hooks';
import JobCard from './JobCard';
import LoadingSpinner from './LoadingSpinner';
import { JobStatus } from '../types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface VirtualizedJobListProps {
  showFilters?: boolean;
  showSearch?: boolean;
  compact?: boolean;
  onJobCancel?: (jobId: string) => void;
  onJobRetry?: (jobId: string) => void;
  onJobView?: (jobId: string) => void;
  height?: number; // Height of the virtualized container
}

const VirtualizedJobList: React.FC<VirtualizedJobListProps> = ({
  showFilters = true,
  showSearch = true,
  compact = false,
  onJobCancel,
  onJobRetry,
  onJobView,
  height = 600
}) => {
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load a large number of jobs for virtualization
  const { data, isLoading, error, refetch } = useJobs({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 1000, // Load more jobs for virtualization
    offset: 0,
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

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredJobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (compact ? 120 : 180), // Estimated height of each job card
    overscan: 5, // Render 5 extra items outside the visible area
  });

  const statusOptions = [
    { value: 'all', label: 'All Status', count: data?.total || 0 },
    { value: JobStatus.PENDING, label: 'Pending', count: 0 },
    { value: JobStatus.IN_PROGRESS, label: 'In Progress', count: 0 },
    { value: JobStatus.COMPLETED, label: 'Completed', count: 0 },
    { value: JobStatus.FAILED, label: 'Failed', count: 0 },
    { value: JobStatus.CANCELLED, label: 'Cancelled', count: 0 }
  ];

  const handleStatusFilterChange = (status: JobStatus | 'all') => {
    setStatusFilter(status);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (newSortBy: 'created_at' | 'updated_at', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading jobs
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Failed to load jobs. Please try again.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => refetch()}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
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

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredJobs.length} of {data?.total || 0} jobs
      </div>

      {/* Virtualized Job List */}
      <div className="bg-white shadow rounded-lg">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredJobs.length === 0 ? (
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
          </div>
        ) : (
          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: `${height}px` }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const job = filteredJobs[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className={compact ? 'p-2' : 'p-4'}
                  >
                    <JobCard
                      job={job}
                      onCancel={onJobCancel}
                      onRetry={onJobRetry}
                      onView={onJobView}
                      compact={compact}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedJobList;