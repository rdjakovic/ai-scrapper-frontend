import React, { useState, useEffect } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface UrlInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  value?: string;
  className?: string;
}

const UrlInput: React.FC<UrlInputProps> = ({
  label = 'URL',
  placeholder = 'https://example.com',
  error,
  registration,
  value,
  className = '',
}) => {
  const [preview, setPreview] = useState<{
    domain: string;
    protocol: string;
    isValid: boolean;
  } | null>(null);

  useEffect(() => {
    if (value) {
      try {
        const url = new URL(value);
        setPreview({
          domain: url.hostname,
          protocol: url.protocol.replace(':', ''),
          isValid: true,
        });
      } catch {
        setPreview({
          domain: '',
          protocol: '',
          isValid: false,
        });
      }
    } else {
      setPreview(null);
    }
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="relative">
        <input
          type="url"
          placeholder={placeholder}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
          {...registration}
        />
        
        {preview && preview.isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="flex items-center space-x-2">
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${preview.protocol === 'https' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
                }
              `}>
                {preview.protocol.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {preview && preview.isValid && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Domain: {preview.domain}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UrlInput;