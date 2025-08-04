import { useQuery, useQueryClient } from '@tanstack/react-query';
import { healthService, HealthMonitorConfig } from '../services/healthService';
import { queryKeys, pollingIntervals } from '../lib/queryClient';
import { useEffect, useRef } from 'react';

/**
 * Hook for checking API health status with automatic polling
 */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthService.checkHealth(),
    // Poll health status every 30 seconds
    refetchInterval: pollingIntervals.health,
    // Keep polling even when window is not focused
    refetchIntervalInBackground: true,
    // Retry health checks more aggressively
    retry: (failureCount) => {
      // Always retry health checks up to 5 times
      return failureCount < 5;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Hook for comprehensive health check with timing and metadata
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: [...queryKeys.health, 'comprehensive'],
    queryFn: () => healthService.performHealthCheck(),
    refetchInterval: pollingIntervals.health,
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook for detailed health information with component status
 */
export function useDetailedHealth() {
  return useQuery({
    queryKey: [...queryKeys.health, 'detailed'],
    queryFn: () => healthService.getDetailedHealth(),
    refetchInterval: pollingIntervals.health,
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook for checking if API is ready to accept new jobs
 */
export function useApiReadiness() {
  return useQuery({
    queryKey: [...queryKeys.health, 'readiness'],
    queryFn: () => healthService.isReadyForJobs(),
    refetchInterval: pollingIntervals.health,
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook for testing API connectivity
 */
export function useConnectivityTest() {
  return useQuery({
    queryKey: [...queryKeys.health, 'connectivity'],
    queryFn: () => healthService.testConnectivity(),
    // Test connectivity less frequently
    refetchInterval: 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook for continuous health monitoring with callbacks
 */
export function useHealthMonitor(config?: Partial<HealthMonitorConfig>) {
  const queryClient = useQueryClient();
  const monitorRef = useRef<boolean>(false);
  
  const defaultConfig: HealthMonitorConfig = {
    interval: pollingIntervals.health,
    timeout: 10000,
    maxRetries: 3,
    onHealthChange: (isHealthy, status) => {
      // Update the health query cache
      if (status) {
        queryClient.setQueryData(queryKeys.health, status);
      }
      
      // Invalidate related queries when health changes
      if (!isHealthy) {
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      }
    },
    onError: (error) => {
      console.error('Health monitoring error:', error);
    },
    ...config,
  };

  useEffect(() => {
    if (!monitorRef.current) {
      healthService.startMonitoring(defaultConfig);
      monitorRef.current = true;
    }

    return () => {
      if (monitorRef.current) {
        healthService.stopMonitoring();
        monitorRef.current = false;
      }
    };
  }, []);

  // Return current health status and monitoring controls
  return {
    isHealthy: healthService.isHealthy(),
    lastStatus: healthService.getLastHealthStatus(),
    startMonitoring: () => healthService.startMonitoring(defaultConfig),
    stopMonitoring: () => healthService.stopMonitoring(),
  };
}

/**
 * Hook that provides a simple health status indicator
 */
export function useHealthStatus() {
  const { data: health, isLoading, error } = useHealth();
  
  const isHealthy = health?.status === 'healthy' || health?.status === 'ok';
  const isDegraded = health?.database !== 'healthy' || health?.redis !== 'healthy';
  
  return {
    status: isHealthy ? (isDegraded ? 'degraded' : 'healthy') : 'unhealthy',
    isHealthy,
    isDegraded,
    isLoading,
    error,
    health,
    // Helper methods
    canCreateJobs: isHealthy && !isDegraded,
    shouldShowWarning: isDegraded || !isHealthy,
  };
}

/**
 * Hook for health-dependent query enabling
 * Disables certain queries when API is unhealthy
 */
export function useHealthDependentQuery() {
  const { isHealthy } = useHealthStatus();
  
  return {
    enabled: isHealthy,
    isHealthy,
  };
}

/**
 * Hook for getting health metrics and statistics
 */
export function useHealthMetrics() {
  const { data: detailedHealth } = useDetailedHealth();
  
  return {
    uptime: detailedHealth?.metadata.uptime || 0,
    responseTime: detailedHealth?.metadata.responseTime || 0,
    version: detailedHealth?.metadata.version || 'unknown',
    components: detailedHealth?.components || {
      api: false,
      database: false,
      redis: false,
    },
    overall: detailedHealth?.overall || false,
  };
}