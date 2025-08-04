import React from 'react';
import { useHealthStatus } from '../hooks';
import { LoadingSpinner } from '../components';

const Health: React.FC = () => {
  const { isHealthy, isLoading, error, health } = useHealthStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="mt-2 text-gray-600">
          Monitor the health and status of the web scraping API.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Checking system health...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg font-medium mb-2">
              Unable to check system health
            </div>
            <p className="text-gray-600">{error.message}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                isHealthy ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-lg font-medium">
                API Status: {isHealthy ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
            
            {health && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                  <p className="text-gray-600">{health.status}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Version</h3>
                  <p className="text-gray-600">{health.version || 'Unknown'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Database</h3>
                  <p className="text-gray-600">{health.database || 'Unknown'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Redis</h3>
                  <p className="text-gray-600">{health.redis || 'Unknown'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Uptime</h3>
                  <p className="text-gray-600">
                    {health.uptime ? `${Math.floor(health.uptime / 60)} minutes` : 'Unknown'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Last Check</h3>
                  <p className="text-gray-600">
                    {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Health;