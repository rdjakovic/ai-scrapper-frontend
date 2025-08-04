import React from 'react';
import RouteGuard from './RouteGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresHealthy?: boolean;
  requiresAuth?: boolean;
  requiredRole?: string;
  fallbackPath?: string;
}

/**
 * ProtectedRoute wrapper that combines multiple protection mechanisms
 * This component serves as a convenient wrapper around RouteGuard
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresHealthy = false,
  requiresAuth = false,
  requiredRole,
  fallbackPath = '/'
}) => {
  // Future: Implement authentication and role-based access control
  // These parameters are kept for future extensibility
  if (requiresAuth || requiredRole) {
    console.warn('Authentication and role-based access control not yet implemented');
  }

  return (
    <RouteGuard
      requiresHealthy={requiresHealthy}
      fallbackPath={fallbackPath}
    >
      {children}
    </RouteGuard>
  );
};

export default ProtectedRoute;