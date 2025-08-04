import React from 'react';
import { getStatusColor, capitalizeFirst } from '../utils';
import { createStatusAria } from '../utils/accessibility';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const colorClasses = getStatusColor(status);
  const statusText = capitalizeFirst(status);
  
  // Map status to semantic meaning for screen readers
  const getStatusType = (status: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success';
      case 'failed':
      case 'error':
        return 'error';
      case 'pending':
      case 'in_progress':
      case 'running':
        return 'warning';
      default:
        return 'info';
    }
  };

  const statusType = getStatusType(status);
  const statusAria = createStatusAria(statusType, `Job status: ${statusText}`);

  // Status icons for better visual recognition
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
      case 'error':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'in_progress':
      case 'running':
        return (
          <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 3a7 7 0 00-7 7 1 1 0 102 0 5 5 0 115 5 1 1 0 100 2 7 7 0 000-14z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v3a1 1 0 11-2 0v-3zm1-3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${colorClasses} ${className}`}
      {...statusAria}
    >
      {showIcon && getStatusIcon(status)}
      <span>{statusText}</span>
      <span className="sr-only">
        {statusType === 'success' && 'completed successfully'}
        {statusType === 'error' && 'failed with error'}
        {statusType === 'warning' && 'in progress'}
        {statusType === 'info' && 'status information'}
      </span>
    </span>
  );
};

export default StatusBadge;
