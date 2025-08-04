import React from 'react';

const Jobs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
        <p className="mt-2 text-gray-600">
          View and manage all your scraping jobs.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Job listing will be implemented in a future task.</p>
      </div>
    </div>
  );
};

export default Jobs;