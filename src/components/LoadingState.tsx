import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
  fullScreen = false,
  overlay = false,
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : overlay
    ? 'absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;