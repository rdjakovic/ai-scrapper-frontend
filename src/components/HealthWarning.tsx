import React from 'react';
import { Link } from 'react-router-dom';
import { useHealthStatus } from '../hooks';
import { HealthIndicator, RetryButton } from './';

interface HealthWarningProps {
  showWhenHealthy?: boolean;
  showRetryButton?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HealthWarning: React.FC<HealthWarningProps> = ({
  showWhenHealthy = false,
  showRetryButton = true,
  className = '',
  size = 'md'
}) => {
  const { 
    status, 
    isHealthy, 
    isDegraded, 
    isLoading, 
    error, 
    canCreateJobs, 
    shouldShowWarning 
  } = useHealthStatus();

  // Don't show anything if healthy and not configured to show
  if (isHealthy && !isDegraded && !showWhenHealthy) {
    return null;
  }

  // Don't show during loading
  if (isLoading) {
    return null;
  }

  // Don't show warning if not needed
  if (!shouldShowWarning && !showWhenHealthy) {
    return null;
  }

  const getWarningStyle = () => {
    if (error || !isHealthy) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-400',
        title: 'text-red-800',
        text: 'text-red-700'
      };
    }
    
    if (isDegraded) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-400',
        title: 'text-yellow-800',
        text: 'text-yellow-700'
      };
    }

    return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      text: 'text-green-700'
    };
  };

  const getWarningTitle = () => {
    if (error || !isHealthy) {
      return 'API Connection Issues';
    }
    
    if (isDegraded) {
      return 'System Performance Warning';
    }

    return 'System Status';
  };

  const getWarningMessage = () => {
    if (error) {
      return `Unable to connect to the API: ${error.message}`;
    }
    
    if (!isHealthy) {
      return 'The API is currently unavailable. Some features may not work properly.';
    }
    
    if (isDegraded) {
      return 'Some system components are experiencing issues. You may experience slower response times.';
    }

    return 'All systems are operating normally.';
  };

  const getWarningIcon = () => {
    if (error || !isHealthy) {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (isDegraded) {
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }

    return (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  };

  const styles = getWarningStyle();
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base'
  };

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={styles.icon}>
            {getWarningIcon()}
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`font-medium ${styles.title}`}>
            {getWarningTitle()}
          </h3>
          
          <div className={`mt-2 ${styles.text}`}>
            <p>{getWarningMessage()}</p>
            
            {!canCreateJobs && (
              <p className="mt-1 font-medium">
                Job creation is currently disabled.
              </p>
            )}
          </div>
          
          <div className="mt-3 flex items-center space-x-4">
            <HealthIndicator size="sm" />
            
            <Link
              to="/health"
              className={`font-medium ${styles.title} hover:underline`}
            >
              View system status →
            </Link>
            
            {showRetryButton && (error || !isHealthy) && (
              <RetryButton 
                onRetry={() => window.location.reload()} 
                size="sm"
                text="Retry"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthWarning;