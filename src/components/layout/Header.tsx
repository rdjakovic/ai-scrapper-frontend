import React from 'react';
import HealthIndicator from '../HealthIndicator';

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
            <HealthIndicator 
              size={isMobile ? 'sm' : 'md'}
              showDetails={!isMobile}
            />
            
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