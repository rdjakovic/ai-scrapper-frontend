import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResults } from '../hooks/useResults';
import { ResultsViewer } from '../components/results';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Results: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { 
    data: jobResult, 
    isLoading, 
    error 
  } = useResults(jobId || '', {
    includeHtml: false,
    includeScreenshot: true,
    enabled: !!jobId
  });

  if (!jobId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="mt-2 text-gray-600">
            Browse and export results from completed scraping jobs.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Job ID Provided</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please provide a job ID to view results. You can access results from the job detail page.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              View All Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Results</h1>
          <p className="mt-2 text-gray-600">
            Results for job {jobId}
          </p>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage message={error instanceof Error ? error.message : String(error)} />
      ) : jobResult ? (
        <ResultsViewer 
          jobResult={jobResult}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">No results found for this job.</p>
        </div>
      )}
    </div>
  );
};

export default Results;