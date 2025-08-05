// Performance monitoring utilities for Core Web Vitals and custom metrics

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

class PerformanceMonitor {
  private metrics: WebVitalsMetrics = {};
  private customMetrics: Map<string, PerformanceMetric> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeWebVitals();
  }

  private initializeWebVitals() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeLCP();

    // First Input Delay (FID)
    this.observeFID();

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // First Contentful Paint (FCP)
    this.observeFCP();

    // Time to First Byte (TTFB)
    this.observeTTFB();
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      
      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        this.metrics.LCP = {
          name: 'LCP',
          value,
          rating: this.getLCPRating(value),
          timestamp: Date.now()
        };
        this.reportMetric(this.metrics.LCP);
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const value = entry.processingStart - entry.startTime;
          this.metrics.FID = {
            name: 'FID',
            value,
            rating: this.getFIDRating(value),
            timestamp: Date.now()
          };
          this.reportMetric(this.metrics.FID);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.metrics.CLS = {
              name: 'CLS',
              value: clsValue,
              rating: this.getCLSRating(clsValue),
              timestamp: Date.now()
            };
            this.reportMetric(this.metrics.CLS);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = {
            name: 'FCP',
            value: entry.startTime,
            rating: this.getFCPRating(entry.startTime),
            timestamp: Date.now()
          };
          this.reportMetric(this.metrics.FCP);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('FCP', observer);
    } catch (e) {
      console.warn('FCP observation not supported');
    }
  }

  private observeTTFB() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.responseStart && entry.requestStart) {
          const value = entry.responseStart - entry.requestStart;
          this.metrics.TTFB = {
            name: 'TTFB',
            value,
            rating: this.getTTFBRating(value),
            timestamp: Date.now()
          };
          this.reportMetric(this.metrics.TTFB);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('TTFB', observer);
    } catch (e) {
      console.warn('TTFB observation not supported');
    }
  }

  // Rating functions based on Core Web Vitals thresholds
  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  // Custom metric tracking
  public trackCustomMetric(name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor') {
    const metric: PerformanceMetric = {
      name,
      value,
      rating: rating || 'good',
      timestamp: Date.now()
    };
    
    this.customMetrics.set(name, metric);
    this.reportMetric(metric);
  }

  // Measure function execution time
  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.trackCustomMetric(`${name}_duration`, end - start);
    return result;
  }

  // Measure async function execution time
  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.trackCustomMetric(`${name}_duration`, end - start);
    return result;
  }

  // Report metric (can be extended to send to analytics service)
  private reportMetric(metric: PerformanceMetric) {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`Performance Metric - ${metric.name}:`, {
        value: Math.round(metric.value * 100) / 100,
        rating: metric.rating,
        timestamp: new Date(metric.timestamp).toISOString()
      });
    }

    // In production, you could send to analytics service
    // Example: sendToAnalytics(metric);
  }

  // Get all current metrics
  public getMetrics(): { webVitals: WebVitalsMetrics; custom: PerformanceMetric[] } {
    return {
      webVitals: this.metrics,
      custom: Array.from(this.customMetrics.values())
    };
  }

  // Clean up observers
  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common performance measurements
export const measurePageLoad = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      performanceMonitor.trackCustomMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
      performanceMonitor.trackCustomMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      performanceMonitor.trackCustomMetric('dom_interactive', navigation.domInteractive - navigation.fetchStart);
    }
  });
};

// Measure component render time
export const measureComponentRender = (componentName: string) => {
  return {
    start: () => {
      const startTime = performance.now();
      return {
        end: () => {
          const endTime = performance.now();
          performanceMonitor.trackCustomMetric(`${componentName}_render_time`, endTime - startTime);
        }
      };
    }
  };
};

// Measure API call performance
export const measureApiCall = async <T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsyncFunction(`api_${name}`, apiCall);
};

export default performanceMonitor;