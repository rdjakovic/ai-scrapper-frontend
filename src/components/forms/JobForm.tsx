import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { jobFormSchema, JobFormData } from '../../schemas/jobSchema';
import { useJobManagement } from '../../hooks/useJobManagement';
import UrlInput from './UrlInput';
import SelectorBuilder from './SelectorBuilder';
import AdvancedOptions from './AdvancedOptions';
import LoadingSpinner from '../LoadingSpinner';

interface JobFormProps {
  onSuccess?: (jobId: string) => void;
  className?: string;
  initialValues?: Partial<JobFormData>;
  mode?: 'create' | 'clone';
}

const JobForm: React.FC<JobFormProps> = ({ onSuccess, className = '', initialValues, mode = 'create' }) => {
  const navigate = useNavigate();
  const { createJob } = useJobManagement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onChange',
    defaultValues: initialValues || {
      url: '',
      timeout: 30,
      javascript: false,
    },
  });

  const watchedUrl = watch('url');

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform the data to match API expectations
      const jobData = {
        url: data.url,
        selectors: data.selectors,
        wait_for: data.wait_for,
        timeout: data.timeout,
        javascript: data.javascript,
        user_agent: data.user_agent,
        headers: data.headers,
        job_metadata: data.job_metadata,
      };

      const result = await createJob(jobData);
      
      if (onSuccess) {
        onSuccess(result.job_id);
      } else {
        // Navigate to job detail page
        navigate(`/jobs/${result.job_id}`);
      }

      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error('Failed to create job:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create job. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitError(null);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* URL Input */}
        <div className="bg-white shadow rounded-lg p-6">
          <UrlInput
            registration={register('url')}
            value={watchedUrl}
            error={errors.url?.message}
          />
        </div>

        {/* Selector Builder */}
        <div className="bg-white shadow rounded-lg p-6">
          <SelectorBuilder
            setValue={setValue}
            watch={watch}
            error={errors.selectors?.message ? String(errors.selectors.message) : undefined}
          />
        </div>

        {/* Advanced Options */}
        <div className="bg-white shadow rounded-lg">
          <AdvancedOptions
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating job
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {submitError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                Reset Form
              </button>
              
              <div className="text-sm text-gray-500">
                {Object.keys(errors).length > 0 && (
                  <span className="text-red-600">
                    Please fix {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''} above
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isSubmitting && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <LoadingSpinner size="sm" />
                  <span>{mode === 'clone' ? 'Cloning job...' : 'Creating job...'}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`
                  inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${!isValid || isSubmitting
                    ? 'border border-gray-300 text-gray-500 bg-gray-50'
                    : mode === 'clone'
                    ? 'border border-purple-300 text-purple-700 bg-white hover:bg-purple-50 focus:ring-purple-500'
                    : 'border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 focus:ring-blue-500'
                  }
                `}
              >
                {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
                {isSubmitting 
                  ? (mode === 'clone' ? 'Cloning...' : 'Creating...') 
                  : (mode === 'clone' ? 'Clone Job' : 'Create Job')
                }
              </button>
            </div>
          </div>

          {/* Form Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">URL:</span>
                <span className="ml-2 text-gray-600 truncate block">
                  {watchedUrl || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Selectors:</span>
                <span className="ml-2 text-gray-600">
                  {watch('selectors') ? Object.keys(watch('selectors') || {}).length : 0} configured
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Timeout:</span>
                <span className="ml-2 text-gray-600">
                  {watch('timeout') || 30} seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobForm;