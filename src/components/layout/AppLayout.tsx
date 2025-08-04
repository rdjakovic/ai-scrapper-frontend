import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import { FocusManager } from '../../utils/accessibility';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarOpen(prev => !prev);
      }

      // Close sidebar with Escape
      if (event.key === 'Escape' && sidebarOpen && isMobile) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, isMobile]);

  // Skip to main content link for screen readers
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />
      
      <div className="flex relative">
        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar 
          isOpen={sidebarOpen}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main 
          id="main-content"
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${isMobile ? 'p-4' : 'p-6'}
            ${!isMobile && sidebarOpen ? 'ml-0' : ''}
          `}
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          <div className={`
            mx-auto
            ${isMobile ? 'max-w-full' : 'max-w-7xl'}
          `}>
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <Breadcrumb />
            </div>
            
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Keyboard shortcuts help (hidden by default) */}
      <div className="sr-only" aria-live="polite" id="keyboard-shortcuts">
        Keyboard shortcuts: Press Ctrl+B to toggle sidebar, Escape to close sidebar
      </div>
    </div>
  );
};

export default AppLayout;