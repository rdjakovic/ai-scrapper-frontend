import React from 'react';
import { useHealthStatus, useJobDashboard } from '../hooks';
import { LoadingSpinner } from '../components';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { canCreateJobs } = useHealthStatus();
  const { 
    activeCount, 
    completedCount, 
    failedCount, 
    totalJobs,
    recentJobs,
    isLoading: jobsLoading 
  } = useJobDashboard();

  const stats = [
    {
      name: 'Total Jobs',
      value: totalJobs,
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: jobsLoading
    },
    {
      name: 'Active Jobs',
      value: activeCount,
      icon: ChartBarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      loading: jobsLoading
    },
    {
      name: 'Completed',
      value: completedCount,
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      loading: jobsLoading
    },
    {
      name: 'Failed',
      value: failedCount,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      loading: jobsLoading
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your web scraping operations and system status.
        </p>
      </div>

      {/* Job Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        stat.value
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Jobs</h2>
              <Link
                to="/jobs"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {jobsLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            ) : recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.slice(0, 5).map((job) => (
                  <div key={job.job_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {job.url}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'failed' ? 'bg-red-100 text-red-800' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No jobs yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first scraping job to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            {!canCreateJobs && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      API Not Ready
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        The API is currently not ready to accept new jobs. 
                        Please check the system status and try again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Link
                to="/create"
                className={`w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                  !canCreateJobs ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={(e) => !canCreateJobs && e.preventDefault()}
              >
                <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Create New Job</div>
                  <div className="text-sm text-gray-500">Start a new web scraping operation</div>
                </div>
              </Link>
              
              <Link
                to="/jobs"
                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">View All Jobs</div>
                  <div className="text-sm text-gray-500">Browse and manage existing jobs</div>
                </div>
              </Link>
              
              <Link
                to="/health"
                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">System Health</div>
                  <div className="text-sm text-gray-500">Check API and system status</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
