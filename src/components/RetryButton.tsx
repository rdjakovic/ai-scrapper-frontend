import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  maxRetries?: number;
  retryCount?: number;
}

const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  disabled = false,
  className = '',
  children = 'Try Again',
  variant = 'secondary',
  size = 'md',
  showIcon = true,
  maxRetries,
  retryCount = 0,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (disabled || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const isDisabled = disabled || isRetrying || (maxRetries !== undefined && retryCount >= maxRetries);

  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    disabled:cursor-not-allowed disabled:opacity-50
    ${getVariantStyles()}
    ${getSizeStyles()}
    ${className}
  `.trim();

  return (
    <button
      onClick={handleRetry}
      disabled={isDisabled}
      className={buttonClasses}
      aria-label={isRetrying ? 'Retrying...' : 'Retry operation'}
    >
      {isRetrying ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Retrying...
        </>
      ) : (
        <>
          {showIcon && (
            <svg
              className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${
                children ? 'mr-2' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          {children}
          {maxRetries !== undefined && (
            <span className="ml-1 text-xs opacity-75">
              ({retryCount}/{maxRetries})
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default RetryButton;