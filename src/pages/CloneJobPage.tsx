import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '../hooks/useJob';
import { LoadingSpinner, ErrorMessage, JobForm } from '../components';
import { JobFormData } from '../schemas/jobSchema';
import { useToast } from '../providers/ToastProvider';

function CloneJobPage() {
  const { jobId } = useParams();
  const { data: job, isLoading, error } = useJob(jobId!);
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  if (isLoading) return <LoadingSpinner />;
  if (error || !job) return <ErrorMessage message={error?.message || 'Job not found'} />;

  // Safely extract values from job metadata with proper undefined handling
  const safelyExtractValue = function <T>(value: unknown, fallback: T): T {
    return value !== null && value !== undefined ? value as T : fallback;
  };

  const initialValues: Partial<JobFormData> = {
    url: job.url,
    selectors: safelyExtractValue(job.job_metadata?.selectors, {}),
    wait_for: safelyExtractValue(job.job_metadata?.wait_for, undefined),
    timeout: safelyExtractValue(job.job_metadata?.timeout, 30),
    javascript: safelyExtractValue(job.job_metadata?.javascript, true),
    user_agent: safelyExtractValue(job.job_metadata?.user_agent, undefined),
    headers: safelyExtractValue(job.job_metadata?.headers, {}),
    job_metadata: {},
  };

  const handleSuccess = (newId: string) => {
    try {
      showSuccess('Job cloned successfully!');
      navigate(`/jobs/${newId}`);
    } catch (error) {
      showError('Failed to navigate to the new job. Please check the jobs list.');
      console.error('Navigation error:', error);
    }
  };

  return (
    <JobForm
      initialValues={initialValues}
      onSuccess={handleSuccess}
      mode="clone"
    />
  );
}

export default CloneJobPage;
