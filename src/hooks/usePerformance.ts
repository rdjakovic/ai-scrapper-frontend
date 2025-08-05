import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, measureComponentRender } from '../utils/performance';

interface UsePerformanceOptions {
  componentName: string;
  trackRender?: boolean;
  trackMount?: boolean;
}

export const usePerformance = ({ 
  componentName, 
  trackRender = true, 
  trackMount = true 
}: UsePerformanceOptions) => {
  const mountTimeRef = useRef<number>();
  const renderMeasurement = useRef<ReturnType<typeof measureComponentRender>>();

  // Track component mount time
  useEffect(() => {
    if (trackMount) {
      const mountTime = performance.now();
      mountTimeRef.current = mountTime;
      
      performanceMonitor.trackCustomMetric(`${componentName}_mount_time`, mountTime);
    }
  }, [componentName, trackMount]);

  // Track render performance
  useEffect(() => {
    if (trackRender) {
      renderMeasurement.current = measureComponentRender(componentName);
      const measurement = renderMeasurement.current.start();
      
      // End measurement on next tick
      const timeoutId = setTimeout(() => {
        measurement.end();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  });

  // Utility function to measure custom operations
  const measureOperation = useCallback((operationName: string, operation: () => void) => {
    return performanceMonitor.measureFunction(`${componentName}_${operationName}`, operation);
  }, [componentName]);

  // Utility function to measure async operations
  const measureAsyncOperation = useCallback(async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsyncFunction(`${componentName}_${operationName}`, operation);
  }, [componentName]);

  // Track custom metrics
  const trackMetric = useCallback((metricName: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor') => {
    performanceMonitor.trackCustomMetric(`${componentName}_${metricName}`, value, rating);
  }, [componentName]);

  return {
    measureOperation,
    measureAsyncOperation,
    trackMetric
  };
};

// Hook for tracking API call performance
export const useApiPerformance = () => {
  const measureApiCall = useCallback(async <T>(apiName: string, apiCall: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      const duration = end - start;
      
      performanceMonitor.trackCustomMetric(`api_${apiName}_success`, duration, 
        duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor'
      );
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      performanceMonitor.trackCustomMetric(`api_${apiName}_error`, duration);
      throw error;
    }
  }, []);

  return { measureApiCall };
};

// Hook for tracking user interactions
export const useInteractionPerformance = (componentName: string) => {
  const trackInteraction = useCallback((interactionType: string, startTime?: number) => {
    const endTime = performance.now();
    const duration = startTime ? endTime - startTime : 0;
    
    performanceMonitor.trackCustomMetric(
      `${componentName}_${interactionType}_interaction`, 
      duration,
      duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
    );
  }, [componentName]);

  const measureClick = useCallback((elementName: string) => {
    const startTime = performance.now();
    return () => trackInteraction(`${elementName}_click`, startTime);
  }, [trackInteraction]);

  const measureFormSubmit = useCallback((formName: string) => {
    const startTime = performance.now();
    return () => trackInteraction(`${formName}_submit`, startTime);
  }, [trackInteraction]);

  return {
    trackInteraction,
    measureClick,
    measureFormSubmit
  };
};