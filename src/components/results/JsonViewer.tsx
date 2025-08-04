import React, { useState } from 'react';
import JsonView from '@uiw/react-json-view';

interface JsonViewerProps {
  data: Record<string, unknown>;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState<boolean | number>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;

    const filterObject = (obj: any, term: string): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (Array.isArray(obj)) {
        const filtered = obj
          .map(item => filterObject(item, term))
          .filter(item => item !== undefined);
        return filtered.length > 0 ? filtered : undefined;
      }
      
      if (typeof obj === 'object') {
        const filtered: any = {};
        let hasMatch = false;
        
        for (const [key, value] of Object.entries(obj)) {
          // Check if key matches
          if (key.toLowerCase().includes(term.toLowerCase())) {
            filtered[key] = value;
            hasMatch = true;
          } else {
            // Check if value matches (for primitive values)
            if (typeof value === 'string' || typeof value === 'number') {
              if (String(value).toLowerCase().includes(term.toLowerCase())) {
                filtered[key] = value;
                hasMatch = true;
              }
            } else {
              // Recursively filter nested objects
              const nestedResult = filterObject(value, term);
              if (nestedResult !== undefined) {
                filtered[key] = nestedResult;
                hasMatch = true;
              }
            }
          }
        }
        
        return hasMatch ? filtered : undefined;
      }
      
      // For primitive values
      if (String(obj).toLowerCase().includes(term.toLowerCase())) {
        return obj;
      }
      
      return undefined;
    };

    const result = filterObject(data, searchTerm);
    return result || {};
  }, [data, searchTerm]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(filteredData, null, 2));
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraped-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search JSON..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCollapsed(collapsed ? false : 2)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {collapsed ? 'Expand All' : 'Collapse All'}
          </button>
          
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          
          <button
            onClick={downloadJson}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">JSON Data</span>
        </div>
        
        <div className="p-4 bg-white max-h-96 overflow-auto">
          {Object.keys(filteredData).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No matches found for your search.' : 'No data available.'}
            </div>
          ) : (
            <JsonView
              value={filteredData}
              collapsed={collapsed}
              style={{
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
              displayDataTypes={true}
              displayObjectSize={true}
              enableClipboard={false}
              shortenTextAfterLength={100}
            />
          )}
        </div>
      </div>

      {/* Search results info */}
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          {Object.keys(filteredData).length > 0 
            ? `Found matches in filtered data` 
            : 'No matches found'
          }
        </div>
      )}
    </div>
  );
};