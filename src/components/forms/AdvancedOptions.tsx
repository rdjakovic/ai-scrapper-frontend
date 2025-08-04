import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { JobFormData } from '../../schemas/jobSchema';

interface AdvancedOptionsProps {
  register: UseFormRegister<JobFormData>;
  setValue: UseFormSetValue<JobFormData>;
  watch: UseFormWatch<JobFormData>;
  errors: FieldErrors<JobFormData>;
}

interface HeaderItem {
  id: string;
  name: string;
  value: string;
}

interface MetadataItem {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  register,
  setValue,
  watch,
  errors,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentHeaders = watch('headers') || {};
  const currentMetadata = watch('job_metadata') || {};

  const [headers, setHeaders] = useState<HeaderItem[]>(() => {
    return Object.entries(currentHeaders).map(([name, value], index) => ({
      id: `header-${index}`,
      name,
      value: String(value),
    }));
  });

  const [metadata, setMetadata] = useState<MetadataItem[]>(() => {
    return Object.entries(currentMetadata).map(([key, value], index) => ({
      id: `metadata-${index}`,
      key,
      value: String(value),
      type: typeof value as 'string' | 'number' | 'boolean',
    }));
  });

  const [newHeader, setNewHeader] = useState({ name: '', value: '' });
  const [newMetadata, setNewMetadata] = useState<{
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean';
  }>({ key: '', value: '', type: 'string' });

  const addHeader = () => {
    if (newHeader.name.trim() && newHeader.value.trim()) {
      const newItem: HeaderItem = {
        id: `header-${Date.now()}`,
        name: newHeader.name.trim(),
        value: newHeader.value.trim(),
      };

      const updatedHeaders = [...headers, newItem];
      setHeaders(updatedHeaders);
      
      const headersObject = updatedHeaders.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {} as Record<string, string>);
      
      setValue('headers', headersObject);
      setNewHeader({ name: '', value: '' });
    }
  };

  const removeHeader = (id: string) => {
    const updatedHeaders = headers.filter(h => h.id !== id);
    setHeaders(updatedHeaders);
    
    const headersObject = updatedHeaders.reduce((acc, item) => {
      acc[item.name] = item.value;
      return acc;
    }, {} as Record<string, string>);
    
    setValue('headers', Object.keys(headersObject).length > 0 ? headersObject : undefined);
  };

  const addMetadata = () => {
    if (newMetadata.key.trim() && newMetadata.value.trim()) {
      let processedValue: string | number | boolean = newMetadata.value.trim();
      
      if (newMetadata.type === 'number') {
        processedValue = parseFloat(newMetadata.value);
      } else if (newMetadata.type === 'boolean') {
        processedValue = newMetadata.value.toLowerCase() === 'true';
      }

      const newItem: MetadataItem = {
        id: `metadata-${Date.now()}`,
        key: newMetadata.key.trim(),
        value: String(processedValue),
        type: newMetadata.type,
      };

      const updatedMetadata = [...metadata, newItem];
      setMetadata(updatedMetadata);
      
      const metadataObject = updatedMetadata.reduce((acc, item) => {
        let value: string | number | boolean = item.value;
        if (item.type === 'number') {
          value = parseFloat(item.value);
        } else if (item.type === 'boolean') {
          value = item.value.toLowerCase() === 'true';
        }
        acc[item.key] = value;
        return acc;
      }, {} as Record<string, string | number | boolean>);
      
      setValue('job_metadata', metadataObject);
      setNewMetadata({ key: '', value: '', type: 'string' });
    }
  };

  const removeMetadata = (id: string) => {
    const updatedMetadata = metadata.filter(m => m.id !== id);
    setMetadata(updatedMetadata);
    
    const metadataObject = updatedMetadata.reduce((acc, item) => {
      let value: string | number | boolean = item.value;
      if (item.type === 'number') {
        value = parseFloat(item.value);
      } else if (item.type === 'boolean') {
        value = item.value.toLowerCase() === 'true';
      }
      acc[item.key] = value;
      return acc;
    }, {} as Record<string, string | number | boolean>);
    
    setValue('job_metadata', Object.keys(metadataObject).length > 0 ? metadataObject : undefined);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">Advanced Options</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-6 border-t border-gray-200">
          {/* Basic Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="300"
                placeholder="30"
                className={`
                  block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.timeout ? 'border-red-300' : 'border-gray-300'}
                `}
                {...register('timeout', { valueAsNumber: true })}
              />
              {errors.timeout && (
                <p className="mt-1 text-sm text-red-600">{errors.timeout.message}</p>
              )}
            </div>

            {/* Wait For Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wait for element (CSS selector)
              </label>
              <input
                type="text"
                placeholder="e.g., .content-loaded"
                className={`
                  block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.wait_for ? 'border-red-300' : 'border-gray-300'}
                `}
                {...register('wait_for')}
              />
              {errors.wait_for && (
                <p className="mt-1 text-sm text-red-600">{errors.wait_for.message}</p>
              )}
            </div>
          </div>

          {/* JavaScript and User Agent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JavaScript */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('javascript')}
                />
                <span className="text-sm font-medium text-gray-700">Enable JavaScript</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Execute JavaScript on the page before scraping
              </p>
            </div>

            {/* User Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Agent
              </label>
              <input
                type="text"
                placeholder="Custom user agent string"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...register('user_agent')}
              />
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Custom Headers
            </label>
            
            {headers.length > 0 && (
              <div className="space-y-2 mb-3">
                {headers.map((header) => (
                  <div key={header.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                      {header.name}:
                    </span>
                    <span className="text-sm text-gray-600 min-w-0 flex-2 truncate">
                      {header.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHeader(header.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Header name"
                value={newHeader.name}
                onChange={(e) => setNewHeader(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Header value"
                value={newHeader.value}
                onChange={(e) => setNewHeader(prev => ({ ...prev, value: e.target.value }))}
                className="flex-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addHeader}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Job Metadata
            </label>
            
            {metadata.length > 0 && (
              <div className="space-y-2 mb-3">
                {metadata.map((meta) => (
                  <div key={meta.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                      {meta.key}:
                    </span>
                    <span className="text-sm text-gray-600 min-w-0 flex-2 truncate">
                      {meta.value}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">
                      {meta.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMetadata(meta.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Key"
                value={newMetadata.key}
                onChange={(e) => setNewMetadata(prev => ({ ...prev, key: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Value"
                value={newMetadata.value}
                onChange={(e) => setNewMetadata(prev => ({ ...prev, value: e.target.value }))}
                className="flex-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newMetadata.type}
                onChange={(e) => setNewMetadata(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'string' | 'number' | 'boolean' 
                }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
              <button
                type="button"
                onClick={addMetadata}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;