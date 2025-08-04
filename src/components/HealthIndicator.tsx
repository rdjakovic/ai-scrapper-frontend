import React from 'react';
import { useHealthStatus, useHealthMetrics } from '../hooks';
import { createStatusAria } from '../utils/accessibility';

interface HealthIndicatorProps {
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  showDetails = false,
  size = 'md',
  className = ''
}) => {
  const { status, isHealthy, isDegraded, isLoading, error, canCreateJobs } = useHealthStatus();
  const { uptime, responseTime, version } = useHealthMetrics();

  const getStatusColor = () => {
    if (isLoading) return 'bg-gray-400 animate-pulse';
    if (isHealthy && !isDegraded) return 'bg-green-500';
    if (isDegraded) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (isHealthy && !isDegraded) return 'Healthy';
    if (isDegraded) return 'Degraded';
    return 'Unavailable';
  };

  const getStatusMessage = () => {
    if (isLoading) return 'Checking API health status';
    if (error) return `API health check failed: ${error.message}`;
    if (isHealthy && !isDegraded) return 'All systems operational';
    if (isDegraded) return 'Some services experiencing issues';
    return 'API is currently unavailable';
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const healthAria = createStatusAria(
    isLoading ? 'info' : (isHealthy ? 'success' : 'error'),
    getStatusMessage()
  );

  return (
    <div className={`flex items-center space-x-2 ${className}`} {...healthAria}>
      {/* Status Indicator Dot */}
      <div
        className={`
          ${sizeClasses[size]} rounded-full transition-colors duration-200
          ${getStatusColor()}
        `}
        aria-hidden="true"
      />

      {/* Status Text */}
      <span
        className={`
          font-medium transition-colors duration-200
          ${textSizeClasses[size]}
          ${isLoading ? 'text-gray-600' :
            isHealthy && !isDegraded ? 'text-green-700' :
            isDegraded ? 'text-yellow-700' : 'text-red-700'}
        `}
      >
        {getStatusText()}
      </span>

      {/* Detailed Information */}
      {showDetails && !isLoading && (
        <div className={`${textSizeClasses[size]} text-gray-600 space-x-4`}>
          {uptime > 0 && (
            <span>
              Uptime: {Math.floor(uptime / 60)}m
            </span>
          )}
          {responseTime > 0 && (
            <span>
              Response: {responseTime}ms
            </span>
          )}
          {version && version !== 'unknown' && (
            <span>
              v{version}
            </span>
          )}
        </div>
      )}

      {/* Warning Icon for Degraded/Unavailable States */}
      {!isLoading && (!canCreateJobs || error) && (
        <div className="flex items-center">
          <svg
            className={`${sizeClasses[size]} ${isDegraded ? 'text-yellow-500' : 'text-red-500'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default HealthIndicator;