import React from 'react';

const Results: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="mt-2 text-gray-600">
          Browse and export results from completed scraping jobs.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Results viewer will be implemented in a future task.</p>
      </div>
    </div>
  );
};

export default Results;