import React, { useState, useEffect } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { generateId, createFieldAria } from '../../utils/accessibility';

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

  const fieldId = generateId('url-input');
  const errorId = `${fieldId}-error`;
  const previewId = `${fieldId}-preview`;
  const helpId = `${fieldId}-help`;

  const describedBy = [];
  if (error) describedBy.push(errorId);
  if (preview?.isValid) describedBy.push(previewId);
  if (!error && !preview) describedBy.push(helpId);

  const fieldAria = createFieldAria({
    required: true,
    invalid: !!error,
    describedBy: describedBy.length > 0 ? describedBy : undefined,
  });

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
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        <span className="sr-only">required</span>
      </label>
      
      <div className="relative">
        <input
          id={fieldId}
          type="url"
          placeholder={placeholder}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
          {...registration}
          {...fieldAria}
        />
        
        {preview && preview.isValid && (
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-hidden="true"
          >
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
        <div 
          id={previewId}
          className="flex items-center space-x-2 text-sm text-gray-600"
          role="status"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4 text-green-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>
            Valid URL - Domain: {preview.domain}
            {preview.protocol === 'https' ? ' (Secure)' : ' (Not secure)'}
          </span>
        </div>
      )}

      {!preview && !error && (
        <p 
          id={helpId}
          className="text-sm text-gray-500"
        >
          Enter a valid URL starting with http:// or https://
        </p>
      )}

      {error && (
        <div 
          id={errorId}
          className="flex items-center space-x-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UrlInput;