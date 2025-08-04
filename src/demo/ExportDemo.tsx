import React from 'react';
import { ExportButton } from '../components/results/ExportButton';
import { JobResult, JobStatus } from '../types';

const ExportDemo: React.FC = () => {
  // Sample data for testing export functionality
  const sampleData = {
    title: 'Sample Web Page',
    description: 'This is a sample description',
    metadata: {
      author: 'John Doe',
      publishDate: '2024-01-15',
      tags: ['web', 'scraping', 'demo']
    },
    content: {
      paragraphs: [
        'This is the first paragraph of content.',
        'This is the second paragraph with more information.',
        'And here is a third paragraph to complete the sample.'
      ],
      links: [
        { text: 'Example Link 1', url: 'https://example1.com' },
        { text: 'Example Link 2', url: 'https://example2.com' }
      ]
    },
    statistics: {
      wordCount: 156,
      linkCount: 2,
      imageCount: 0
    }
  };

  const sampleJobResult: JobResult = {
    job_id: 'demo-job-12345',
    url: 'https://example.com/sample-page',
    status: JobStatus.COMPLETED,
    data: sampleData,
    scraped_at: '2024-01-15T10:30:00Z',
    processing_time: 2500
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Export Functionality Demo
        </h1>
        <p className="text-gray-600 mb-6">
          This demo shows the enhanced export functionality with progress indicators,
          multiple format options, and advanced configuration settings.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Sample Data Preview</h2>
          <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-auto max-h-64">
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
            <p className="text-sm text-gray-600">
              Click the export button to see the enhanced export functionality with:
            </p>
            <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
              <li>JSON and CSV format options</li>
              <li>Progress indicators for large datasets</li>
              <li>Advanced options (metadata, flattening, custom filename)</li>
              <li>Data size estimation</li>
              <li>Error handling</li>
            </ul>
          </div>
          
          <div className="ml-6">
            <ExportButton 
              data={sampleData} 
              jobId={sampleJobResult.job_id}
              jobResult={sampleJobResult}
              className="ml-4"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Export Features Implemented
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Format Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                JSON export with pretty formatting
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                CSV export with object flattening
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tabular CSV for array data
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Advanced Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Progress indicators for large datasets
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom filename support
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Metadata inclusion options
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Implementation Notes</h3>
            <p className="text-sm text-blue-700 mt-1">
              The export functionality includes comprehensive data transformation utilities,
              proper file naming with timestamps, progress simulation for large datasets,
              and graceful error handling. The component is fully integrated with the
              existing ResultsViewer and supports both standalone and integrated usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDemo;