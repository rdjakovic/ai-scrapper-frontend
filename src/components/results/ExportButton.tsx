import React, { useState } from 'react';

interface ExportButtonProps {
  data: Record<string, unknown>;
  jobId: string;
  className?: string;
}

type ExportFormat = 'json' | 'csv';

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  jobId,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const generateFileName = (format: ExportFormat): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `scraped-data-${jobId}-${timestamp}.${format}`;
  };

  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] === null || obj[key] === undefined) {
          flattened[newKey] = obj[key];
        } else if (Array.isArray(obj[key])) {
          // Handle arrays by creating indexed keys
          obj[key].forEach((item: any, index: number) => {
            if (typeof item === 'object' && item !== null) {
              Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
            } else {
              flattened[`${newKey}[${index}]`] = item;
            }
          });
        } else if (typeof obj[key] === 'object') {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const convertToCSV = (data: Record<string, unknown>): string => {
    const flattened = flattenObject(data);
    const entries = Object.entries(flattened);
    
    if (entries.length === 0) {
      return 'No data available';
    }

    // Create CSV with Key, Value, Type columns
    const headers = ['Key', 'Value', 'Type'];
    const rows = entries.map(([key, value]) => {
      const type = value === null ? 'null' : 
                   value === undefined ? 'undefined' : 
                   Array.isArray(value) ? 'array' : 
                   typeof value;
      
      // Escape CSV values
      const escapeCSV = (val: string): string => {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      return [
        escapeCSV(key),
        escapeCSV(String(value)),
        escapeCSV(type)
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      let content: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
      } else if (format === 'csv') {
        content = convertToCSV(data);
        mimeType = 'text/csv';
      } else {
        throw new Error('Unsupported export format');
      }

      const filename = generateFileName(format);
      downloadFile(content, filename, mimeType);
    } catch (error) {
      console.error('Export failed:', error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
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
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              Exporting...
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

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as JSON
              </button>
              
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Export as CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};