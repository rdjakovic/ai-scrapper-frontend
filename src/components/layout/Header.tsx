import React from 'react';
import { useHealthStatus } from '../../hooks';
import { createStatusAria } from '../../utils/accessibility';

interface HeaderProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  sidebarOpen = false, 
  isMobile = false 
}) => {
  const { isHealthy, isLoading: healthLoading } = useHealthStatus();

  const healthStatus = healthLoading ? 'info' : (isHealthy ? 'success' : 'error');
  const healthMessage = healthLoading ? 'Checking API status' : 
                       (isHealthy ? 'API is healthy' : 'API is unavailable');

  const healthAria = createStatusAria(healthStatus, healthMessage);

  return (
    <header 
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button and Logo/Title */}
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                type="button"
                onClick={onMenuToggle}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                aria-expanded={sidebarOpen}
                aria-controls="sidebar-navigation"
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <span className="sr-only">
                  {sidebarOpen ? 'Close menu' : 'Open menu'}
                </span>
                {sidebarOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
            
            <div className="flex items-center">
              <h1 className={`
                font-semibold text-gray-900
                ${isMobile ? 'text-lg' : 'text-xl'}
              `}>
                <span className={isMobile ? 'hidden sm:inline' : ''}>
                  Web Scraping Dashboard
                </span>
                <span className={isMobile ? 'sm:hidden' : 'hidden'}>
                  Scraper
                </span>
              </h1>
            </div>
          </div>
          
          {/* Health Status Indicator */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-2"
              {...healthAria}
            >
              <div 
                className={`
                  w-3 h-3 rounded-full transition-colors duration-200
                  ${healthLoading ? 'bg-gray-400 animate-pulse' :
                    isHealthy ? 'bg-green-500' : 'bg-red-500'}
                `}
                aria-hidden="true"
              />
              <span className={`
                text-sm font-medium
                ${isMobile ? 'hidden sm:inline' : ''}
                ${healthLoading ? 'text-gray-600' :
                  isHealthy ? 'text-green-700' : 'text-red-700'}
              `}>
                {isMobile ? (
                  <>
                    <span className="sm:hidden">
                      {healthLoading ? '...' : (isHealthy ? '✓' : '✗')}
                    </span>
                    <span className="hidden sm:inline">
                      {healthLoading ? 'Checking...' : 
                       isHealthy ? 'API Healthy' : 'API Unavailable'}
                    </span>
                  </>
                ) : (
                  healthLoading ? 'Checking...' : 
                  isHealthy ? 'API Healthy' : 'API Unavailable'
                )}
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