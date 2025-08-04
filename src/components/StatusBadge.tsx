import React from 'react';
import { getStatusColor, capitalizeFirst } from '../utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const colorClasses = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}
    >
      {capitalizeFirst(status)}
    </span>
  );
};

export default StatusBadge;
