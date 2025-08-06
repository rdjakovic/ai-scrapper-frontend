import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FocusManager, KeyboardNavigation } from '../../utils/accessibility';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

// Simple icon components using SVG with proper accessibility
const DashboardIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ListIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const ChartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const HealthIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
  </svg>
);

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: DashboardIcon,
    description: 'Overview and statistics'
  },
  {
    name: 'Create Job',
    href: '/create',
    icon: PlusIcon,
    description: 'Start a new scraping job'
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: ListIcon,
    description: 'View all scraping jobs'
  },
  {
    name: 'Results',
    href: '/results',
    icon: ChartIcon,
    description: 'Browse job results'
  },
  {
    name: 'Health',
    href: '/health',
    icon: HealthIcon,
    description: 'System health status'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = true, 
  isMobile = false, 
  onClose 
}) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Focus management for mobile sidebar
  useEffect(() => {
    if (isMobile && isOpen && sidebarRef.current) {
      const cleanup = FocusManager.trapFocus(sidebarRef.current);
      return cleanup;
    }
  }, [isMobile, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!navRef.current) return;

      const navItems = Array.from(navRef.current.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
      const currentIndex = navItems.findIndex(item => item === document.activeElement);

      if (currentIndex !== -1) {
        KeyboardNavigation.handleArrowKeys(event, navItems, currentIndex, (newIndex) => {
          navItems[newIndex]?.focus();
        });
      }
    };

    if (navRef.current) {
      navRef.current.addEventListener('keydown', handleKeyDown);
      return () => navRef.current?.removeEventListener('keydown', handleKeyDown);
    }
  }, []);


  return (
    <aside 
      ref={sidebarRef}
      id="sidebar-navigation"
      className={`
        bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isMobile ? (
          `fixed inset-y-0 left-0 z-50 w-64 transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`
        ) : (
          `w-64 min-h-screen ${isOpen ? 'block' : 'hidden lg:block'}`
        )}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Mobile close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Close navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <nav 
        ref={navRef}
        className="p-4"
        role="menu"
        aria-label="Main navigation menu"
      >
        <div className="space-y-1">
          {navigation.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              role="menuitem"
              tabIndex={index === 0 ? 0 : -1}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              aria-describedby={`nav-desc-${item.name.toLowerCase().replace(' ', '-')}`}
              aria-current={location.pathname === item.href ? 'page' : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                  <span 
                    id={`nav-desc-${item.name.toLowerCase().replace(' ', '-')}`}
                    className="sr-only"
                  >
                    {item.description}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* Sidebar Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 px-3">
            <p>Web Scraping UI</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;