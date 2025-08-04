import React from 'react';

const CreateJob: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="mt-2 text-gray-600">
          Start a new web scraping job by configuring the URL and selectors.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Job creation form will be implemented in a future task.</p>
      </div>
    </div>
  );
};

export default CreateJob;