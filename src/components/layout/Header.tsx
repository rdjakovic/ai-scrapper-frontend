import React from 'react';
import { useHealthStatus } from '../../hooks';

const Header: React.FC = () => {
  const { isHealthy, isLoading: healthLoading } = useHealthStatus();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Web Scraping Dashboard
            </h1>
          </div>
          
          {/* Health Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  healthLoading ? 'bg-gray-400 animate-pulse' :
                  isHealthy ? 'bg-green-500' : 'bg-red-500'
                }`} 
                title={healthLoading ? 'Checking API status...' : 
                       isHealthy ? 'API is healthy' : 'API is unavailable'}
              />
              <span className="text-sm text-gray-600 font-medium">
                {healthLoading ? 'Checking...' : 
                 isHealthy ? 'API Healthy' : 'API Unavailable'}
              </span>
            </div>
            
            {/* Future: User menu, notifications, etc. */}
            <div className="flex items-center space-x-2">
              {/* Placeholder for future user actions */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;