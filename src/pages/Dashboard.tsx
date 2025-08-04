import React from 'react';
import { useHealthStatus, useJobDashboard } from '../hooks';
import { LoadingSpinner } from '../components';

const Dashboard: React.FC = () => {
  const { canCreateJobs } = useHealthStatus();
  const { 
    activeCount, 
    completedCount, 
    failedCount, 
    totalJobs,
    isLoading: jobsLoading 
  } = useJobDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your web scraping operations and system status.
        </p>
      </div>

      {/* System Status Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {jobsLoading ? <LoadingSpinner size="sm" className="mx-auto" /> : totalJobs}
            </div>
            <div className="text-sm text-gray-500">Total Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {jobsLoading ? <LoadingSpinner size="sm" className="mx-auto" /> : activeCount}
            </div>
            <div className="text-sm text-gray-500">Active Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {jobsLoading ? <LoadingSpinner size="sm" className="mx-auto" /> : completedCount}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {jobsLoading ? <LoadingSpinner size="sm" className="mx-auto" /> : failedCount}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Welcome to Web Scraping Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Your web scraping interface is ready with a modern layout and navigation.
          </p>
          
          {!canCreateJobs && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
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
          
          <div className="text-sm text-gray-500">
            <p>Features implemented:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Modern layout with sidebar navigation</li>
              <li>Real-time health monitoring in header</li>
              <li>Responsive design for all screen sizes</li>
              <li>Active navigation state management</li>
              <li>Accessible navigation with keyboard support</li>
            </ul>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button 
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              disabled={!canCreateJobs}
            >
              <div className="font-medium text-gray-900">Create New Job</div>
              <div className="text-sm text-gray-500">Start a new web scraping operation</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">View All Jobs</div>
              <div className="text-sm text-gray-500">Browse and manage existing jobs</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">System Health</div>
              <div className="text-sm text-gray-500">Check API and system status</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
