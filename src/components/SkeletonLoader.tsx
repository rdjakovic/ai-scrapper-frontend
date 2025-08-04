import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false,
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${width} ${height} ${
        rounded ? 'rounded-full' : 'rounded'
      } ${className}`}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <SkeletonLoader width="w-10" height="h-10" rounded />
        <div className="flex-1">
          <SkeletonLoader width="w-3/4" height="h-4" className="mb-2" />
          <SkeletonLoader width="w-1/2" height="h-3" />
        </div>
      </div>
      <SkeletonLoader width="w-full" height="h-3" className="mb-2" />
      <SkeletonLoader width="w-5/6" height="h-3" className="mb-2" />
      <SkeletonLoader width="w-4/5" height="h-3" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => (
  <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} width="w-3/4" height="h-4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b border-gray-100 last:border-b-0">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} width="w-full" height="h-4" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
        <SkeletonLoader width="w-12" height="h-12" rounded />
        <div className="flex-1">
          <SkeletonLoader width="w-3/4" height="h-4" className="mb-2" />
          <SkeletonLoader width="w-1/2" height="h-3" />
        </div>
        <SkeletonLoader width="w-20" height="h-8" />
      </div>
    ))}
  </div>
);

export default SkeletonLoader;