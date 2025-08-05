import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performance';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsMetrics {
  CLS?: PerformanceMetric;
  FID?: PerformanceMetric;
  FCP?: PerformanceMetric;
  LCP?: PerformanceMetric;
  TTFB?: PerformanceMetric;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<{ webVitals: WebVitalsMetrics; custom: PerformanceMetric[] }>({
    webVitals: {},
    custom: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial load

    return () => clearInterval(interval);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name.includes('time') || name.includes('duration')) {
      return `${Math.round(value)}ms`;
    }
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return Math.round(value).toString();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Show Performance Metrics"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Core Web Vitals */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Core Web Vitals</h4>
        <div className="space-y-2">
          {Object.entries(metrics.webVitals).map(([key, metric]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{key}</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono">{formatValue(key, metric.value)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(metric.rating)}`}>
                  {metric.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Metrics */}
      {metrics.custom.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Metrics</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {metrics.custom
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 10) // Show only last 10 metrics
              .map((metric, index) => (
                <div key={`${metric.name}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate" title={metric.name}>
                    {metric.name.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{formatValue(metric.name, metric.value)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(metric.rating)}`}>
                      {metric.rating}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Needs Improvement</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Poor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;