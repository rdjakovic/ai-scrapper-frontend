import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components';
import { Dashboard, CreateJob, Jobs, JobDetail, Results, Health, NotFound } from './pages';
import { ProtectedRoute } from './components/routing';
import ErrorHandlingDemo from './demo/ErrorHandlingDemo';

function App() {
  return (
    <Router>
      <AppLayout>
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
      </AppLayout>
    </Router>
  );
}

export default App;
