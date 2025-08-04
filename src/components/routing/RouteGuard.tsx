import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useHealth } from '../../hooks/useHealth';
import LoadingSpinner from '../LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
  requiresHealthy?: boolean;
  fallbackPath?: string;
}

/**
 * RouteGuard component that protects routes based on various conditions
 * Currently implements health-based protection, but can be extended for authentication
 */
const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiresHealthy = false,
  fallbackPath = '/' // Reserved for future use - currently unused
}) => {
  const location = useLocation();
  const { data: health, isLoading, error } = useHealth();

  // Suppress unused variable warning - fallbackPath is reserved for future use
  void fallbackPath;

  // Show loading state while checking health
  if (requiresHealthy && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Redirect if health check is required but system is unhealthy
  if (requiresHealthy && (error || health?.status !== 'healthy')) {
    return (
      <Navigate 
        to="/health" 
        state={{ 
          from: location.pathname,
          reason: 'System health check required'
        }} 
        replace 
      />
    );
  }

  // Future: Add authentication checks here
  // if (requiresAuth && !isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // Future: Add role-based access control
  // if (requiredRole && !hasRole(requiredRole)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
};

export default RouteGuard;