import React from 'react';
import { JobForm } from '../components/forms';

const CreateJob: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="mt-2 text-gray-600">
          Start a new web scraping job by configuring the URL and selectors.
        </p>
      </div>
      
      <JobForm />
    </div>
  );
};

export default CreateJob;