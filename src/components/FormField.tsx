import React, { ReactNode } from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  helpText?: string;
  id?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  className = '',
  helpText,
  id,
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined,
          className: `${(children as React.ReactElement).props.className || ''} ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`,
        })}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-sm text-red-600 flex items-center"
          role="alert"
        >
          <svg
            className="h-4 w-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p
          id={`${fieldId}-help`}
          className="text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;