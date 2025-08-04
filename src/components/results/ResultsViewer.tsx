import React, { useState } from 'react';
import { JobResult } from '../../types';
import { DataTable } from './DataTable';
import { JsonViewer } from './JsonViewer';
import { ScreenshotViewer } from './ScreenshotViewer';
import { ExportButton } from './ExportButton';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

export type ViewMode = 'table' | 'json' | 'raw';

interface ResultsViewerProps {
  jobResult: JobResult;
  isLoading?: boolean;
  error?: string | Error | null;
  className?: string;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({
  jobResult,
  isLoading = false,
  error,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showScreenshot, setShowScreenshot] = useState(false);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <div className={className}>
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  if (!jobResult.data) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">No Results Available</h3>
            <p className="mt-1 text-sm text-yellow-700">
              This job hasn't produced any results yet. The job may still be processing or may have failed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasScreenshot = !!jobResult.screenshot;
  const hasData = !!jobResult.data && Object.keys(jobResult.data).length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Scraped Results</h2>
          <p className="text-sm text-gray-600">
            Scraped from {jobResult.url} on {jobResult.scraped_at ? new Date(jobResult.scraped_at).toLocaleString() : 'Unknown date'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasScreenshot && (
            <button
              onClick={() => setShowScreenshot(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Screenshot
            </button>
          )}
          
          <ExportButton data={jobResult.data} jobId={jobResult.job_id} jobResult={jobResult} />
        </div>
      </div>

      {/* View mode selector */}
      {hasData && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setViewMode('table')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'table'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'json'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              JSON View
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'raw'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Raw Data
            </button>
          </nav>
        </div>
      )}

      {/* Content area */}
      <div className="bg-white shadow rounded-lg">
        {hasData ? (
          <>
            {viewMode === 'table' && <DataTable data={jobResult.data} />}
            {viewMode === 'json' && <JsonViewer data={jobResult.data} />}
            {viewMode === 'raw' && (
              <div className="p-6">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                  {JSON.stringify(jobResult.data, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No data available to display
          </div>
        )}
      </div>

      {/* Processing info */}
      {jobResult.processing_time && (
        <div className="text-sm text-gray-600">
          Processing time: {jobResult.processing_time}ms
        </div>
      )}

      {/* Screenshot modal */}
      {showScreenshot && hasScreenshot && (
        <ScreenshotViewer
          screenshot={jobResult.screenshot!}
          url={jobResult.url}
          onClose={() => setShowScreenshot(false)}
        />
      )}
    </div>
  );
};