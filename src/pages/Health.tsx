import React from 'react';
import { useHealthStatus, useHealthMetrics, useDetailedHealth, useConnectivityTest } from '../hooks';
import { LoadingSpinner, HealthIndicator, RetryButton } from '../components';

const Health: React.FC = () => {
  const { status, isHealthy, isDegraded, isLoading, error, health, canCreateJobs } = useHealthStatus();
  const { uptime, responseTime, version, components, overall } = useHealthMetrics();
  const { data: detailedHealth, isLoading: detailedLoading, refetch: refetchDetailed } = useDetailedHealth();
  const { data: connectivityTest, isLoading: connectivityLoading, refetch: refetchConnectivity } = useConnectivityTest();

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  };

  const getComponentStatus = (componentHealthy: boolean) => ({
    color: componentHealthy ? 'text-green-600' : 'text-red-600',
    bg: componentHealthy ? 'bg-green-50' : 'bg-red-50',
    text: componentHealthy ? 'Healthy' : 'Unhealthy'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="mt-2 text-gray-600">
            Monitor the health and status of the web scraping API and its components.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <HealthIndicator size="lg" showDetails />
          <RetryButton
            onRetry={() => {
              refetchDetailed();
              refetchConnectivity();
            }}
            isLoading={detailedLoading || connectivityLoading}
            size="sm"
          />
        </div>
      </div>

      {/* Overall Status Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Overall Status</h2>
          <div className="text-sm text-gray-500">
            Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Unknown'}
          </div>
        </div>

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
            <p className="text-gray-600 mb-4">{error.message}</p>
            <RetryButton onRetry={refetchDetailed} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isHealthy && !isDegraded ? 'bg-green-100 text-green-800' :
                isDegraded ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
              <p className="mt-2 text-sm text-gray-600">System Status</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {responseTime > 0 ? `${responseTime}ms` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Response Time</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {uptime > 0 ? formatUptime(uptime) : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
        )}
      </div>

      {/* Component Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Component Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* API Component */}
          <div className={`p-4 rounded-lg border ${getComponentStatus(components.api).bg}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">API Server</h3>
              <span className={`text-sm font-medium ${getComponentStatus(components.api).color}`}>
                {getComponentStatus(components.api).text}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Main API endpoint availability
            </p>
          </div>

          {/* Database Component */}
          <div className={`p-4 rounded-lg border ${getComponentStatus(components.database).bg}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Database</h3>
              <span className={`text-sm font-medium ${getComponentStatus(components.database).color}`}>
                {getComponentStatus(components.database).text}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              PostgreSQL connection status
            </p>
          </div>

          {/* Redis Component */}
          <div className={`p-4 rounded-lg border ${getComponentStatus(components.redis).bg}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Redis Cache</h3>
              <span className={`text-sm font-medium ${getComponentStatus(components.redis).color}`}>
                {getComponentStatus(components.redis).text}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Cache and queue system status
            </p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">API Version</h3>
            <p className="text-gray-600">{version || 'Unknown'}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Job Creation</h3>
            <p className={`font-medium ${canCreateJobs ? 'text-green-600' : 'text-red-600'}`}>
              {canCreateJobs ? 'Available' : 'Disabled'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Connectivity Test</h3>
            <div className="flex items-center space-x-2">
              {connectivityLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${
                  connectivityTest ? 'bg-green-500' : 'bg-red-500'
                }`} />
              )}
              <span className={`text-sm ${
                connectivityTest ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectivityLoading ? 'Testing...' : 
                 connectivityTest ? 'Connected' : 'Failed'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Last Health Check</h3>
            <p className="text-gray-600">
              {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings and Alerts */}
      {(!canCreateJobs || isDegraded || error) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Warnings</h2>
          
          <div className="space-y-3">
            {!canCreateJobs && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Job Creation Disabled</h3>
                  <p className="text-sm text-red-700 mt-1">
                    New job creation is currently disabled due to system health issues.
                  </p>
                </div>
              </div>
            )}
            
            {isDegraded && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Degraded Performance</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some system components are experiencing issues. Functionality may be limited.
                  </p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Health;