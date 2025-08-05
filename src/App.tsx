import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout, LoadingSpinner } from './components';
import { Dashboard, CreateJob, Jobs, JobDetail, Results, Health, NotFound } from './pages';
import { ProtectedRoute } from './components/routing';
import { performanceMonitor, measurePageLoad } from './utils/performance';
import { config } from './config/environment';
import { registerServiceWorker, optimizeFontLoading } from './utils/cdn';
import PerformanceDashboard from './components/PerformanceDashboard';

// Lazy load demo components
const ErrorHandlingDemo = lazy(() => import('./demo/ErrorHandlingDemo'));

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    measurePageLoad();

    // Initialize CDN and optimization features
    optimizeFontLoading();
    registerServiceWorker();

    // Set document title from config
    document.title = config.appTitle;
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.appDescription);
    }

    // Cleanup on unmount
    return () => {
      performanceMonitor.disconnect();
    };
  }, []);

  return (
    <Router>
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/health" element={<Health />} />
          
          {/* Protected routes that require healthy API */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute requiresHealthy={true}>
                <CreateJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute requiresHealthy={true}>
                <Jobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:jobId" 
            element={
              <ProtectedRoute requiresHealthy={true}>
                <JobDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results" 
            element={
              <ProtectedRoute requiresHealthy={true}>
                <Results />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results/:jobId" 
            element={
              <ProtectedRoute requiresHealthy={true}>
                <Results />
              </ProtectedRoute>
            } 
          />
          
          {/* Demo routes */}
          <Route path="/demo/error-handling" element={<ErrorHandlingDemo />} />
          
          {/* 404 catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </AppLayout>
      
      {/* Performance Dashboard - only show when devtools enabled */}
      {config.enableDevtools && <PerformanceDashboard />}
    </Router>
  );
}

export default App;
