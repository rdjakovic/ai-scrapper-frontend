import React, { useState } from 'react';
import { JobResult, JobStatus } from '../../types';
import { 
  exportJobResult, 
  ExportFormat, 
  ExportOptions, 
  ExportProgress,
  estimateExportSize 
} from '../../utils/exportUtils';

interface ExportButtonProps {
  data: Record<string, unknown>;
  jobId: string;
  className?: string;
  jobResult?: JobResult; // Optional for enhanced functionality
}

interface ExportState {
  isExporting: boolean;
  showDropdown: boolean;
  showAdvanced: boolean;
  progress?: ExportProgress;
  error?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  jobId,
  className = '',
  jobResult,
}) => {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    showDropdown: false,
    showAdvanced: false,
  });

  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    includeMetadata: false,
    flattenObjects: true,
  });

  const dataSize = estimateExportSize(data);
  const isLargeDataset = dataSize > 100000; // 100KB threshold

  const handleExport = async (format: ExportFormat) => {
    setState(prev => ({ 
      ...prev, 
      isExporting: true, 
      showDropdown: false, 
      error: undefined 
    }));

    try {
      const options: ExportOptions = {
        format,
        ...exportOptions,
      };

      // Create a mock JobResult if not provided
      const resultToExport = jobResult || {
        job_id: jobId,
        url: 'unknown',
        status: JobStatus.COMPLETED,
        data,
      };

      const onProgress = isLargeDataset ? (progress: ExportProgress) => {
        setState(prev => ({ ...prev, progress }));
      } : undefined;

      await exportJobResult(resultToExport, options, onProgress);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        progress: {
          stage: 'complete',
          progress: 0,
          message: errorMessage
        }
      }));
      console.error('Export failed:', error);
    } finally {
      setState(prev => ({ ...prev, isExporting: false }));
      
      // Clear progress after a delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: undefined, error: undefined }));
      }, 3000);
    }
  };

  const toggleAdvanced = () => {
    setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  };

  const updateExportOption = <K extends keyof ExportOptions>(
    key: K, 
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const hasData = data && Object.keys(data).length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div>
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, showDropdown: !prev.showDropdown }))}
          disabled={state.isExporting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.isExporting ? (
            <>
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              {state.progress?.message || 'Exporting...'}
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
              <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Progress indicator for large datasets */}
      {state.isExporting && state.progress && isLargeDataset && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-30">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{state.progress.message}</span>
            <span>{state.progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {state.error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-md shadow-lg p-3 z-30">
          <div className="flex items-center text-sm text-red-600">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.error}
          </div>
        </div>
      )}

      {state.showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setState(prev => ({ ...prev, showDropdown: false }))}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              {/* Data size indicator */}
              <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Data size: {(dataSize / 1024).toFixed(1)} KB</span>
                  {isLargeDataset && (
                    <span className="text-yellow-600">Large dataset</span>
                  )}
                </div>
              </div>

              {/* Export format buttons */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => handleExport('json')}
                  disabled={state.isExporting}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md disabled:opacity-50"
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <div>Export as JSON</div>
                    <div className="text-xs text-gray-500">Structured data format</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleExport('csv')}
                  disabled={state.isExporting}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md disabled:opacity-50"
                >
                  <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <div className="text-left">
                    <div>Export as CSV</div>
                    <div className="text-xs text-gray-500">Spreadsheet compatible</div>
                  </div>
                </button>
              </div>

              {/* Advanced options toggle */}
              <button
                onClick={toggleAdvanced}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border-t border-gray-200 pt-3"
              >
                <span>Advanced Options</span>
                <svg 
                  className={`h-4 w-4 transform transition-transform ${state.showAdvanced ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Advanced options */}
              {state.showAdvanced && (
                <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata || false}
                      onChange={(e) => updateExportOption('includeMetadata', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include metadata</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.flattenObjects || false}
                      onChange={(e) => updateExportOption('flattenObjects', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Flatten nested objects (CSV)</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Custom filename (optional)</label>
                    <input
                      type="text"
                      placeholder="custom-export-name"
                      value={exportOptions.customFileName || ''}
                      onChange={(e) => updateExportOption('customFileName', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};