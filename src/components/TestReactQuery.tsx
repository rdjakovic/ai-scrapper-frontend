import React from 'react';
import { useHealth, useJobs } from '../hooks';

/**
 * Test component to verify React Query setup is working
 */
export function TestReactQuery() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useJobs({ limit: 5 });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        React Query Test
      </h3>
      
      {/* Health Status Test */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-2">Health Check</h4>
        {healthLoading && <p className="text-blue-600">Loading health status...</p>}
        {healthError && <p className="text-red-600">Health check failed: {healthError.message}</p>}
        {health && (
          <div className="text-sm text-gray-600">
            <p>Status: <span className="font-medium">{health.status}</span></p>
            <p>Database: <span className="font-medium">{health.database}</span></p>
            <p>Redis: <span className="font-medium">{health.redis}</span></p>
            <p>Version: <span className="font-medium">{health.version}</span></p>
          </div>
        )}
      </div>

      {/* Jobs List Test */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-2">Recent Jobs</h4>
        {jobsLoading && <p className="text-blue-600">Loading jobs...</p>}
        {jobsError && <p className="text-red-600">Jobs fetch failed: {jobsError.message}</p>}
        {jobsData && (
          <div className="text-sm text-gray-600">
            <p>Total Jobs: <span className="font-medium">{jobsData.total}</span></p>
            <p>Loaded: <span className="font-medium">{jobsData.jobs.length}</span></p>
            {jobsData.jobs.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Recent Jobs:</p>
                <ul className="list-disc list-inside mt-1">
                  {jobsData.jobs.slice(0, 3).map(job => (
                    <li key={job.job_id} className="text-xs">
                      {job.job_id} - {job.status} - {job.url}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}