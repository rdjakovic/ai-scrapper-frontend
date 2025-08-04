import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to breadcrumb mapping
const routeToBreadcrumb: Record<string, (params?: Record<string, string>) => BreadcrumbItem[]> = {
  '/': () => [
    { label: 'Dashboard', current: true }
  ],
  '/create': () => [
    { label: 'Dashboard', href: '/' },
    { label: 'Create Job', current: true }
  ],
  '/jobs': () => [
    { label: 'Dashboard', href: '/' },
    { label: 'Jobs', current: true }
  ],
  '/jobs/:jobId': (params) => [
    { label: 'Dashboard', href: '/' },
    { label: 'Jobs', href: '/jobs' },
    { label: params?.jobId ? `Job ${params.jobId.slice(0, 8)}...` : 'Job Details', current: true }
  ],
  '/results': () => [
    { label: 'Dashboard', href: '/' },
    { label: 'Results', current: true }
  ],
  '/results/:jobId': (params) => [
    { label: 'Dashboard', href: '/' },
    { label: 'Results', href: '/results' },
    { label: params?.jobId ? `Job ${params.jobId.slice(0, 8)}...` : 'Job Results', current: true }
  ],
  '/health': () => [
    { label: 'Dashboard', href: '/' },
    { label: 'System Health', current: true }
  ]
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();

  // Generate breadcrumb items from current route if not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;

    const pathname = location.pathname;
    
    // Extract parameters from pathname (simple implementation)
    const pathSegments = pathname.split('/').filter(Boolean);
    const params: Record<string, string> = {};
    
    // Check for dynamic routes
    let matchedRoute = pathname;
    for (const route in routeToBreadcrumb) {
      const routeSegments = route.split('/').filter(Boolean);
      if (routeSegments.length === pathSegments.length) {
        let isMatch = true;
        const routeParams: Record<string, string> = {};
        
        for (let i = 0; i < routeSegments.length; i++) {
          if (routeSegments[i].startsWith(':')) {
            const paramName = routeSegments[i].slice(1);
            routeParams[paramName] = pathSegments[i];
          } else if (routeSegments[i] !== pathSegments[i]) {
            isMatch = false;
            break;
          }
        }
        
        if (isMatch) {
          matchedRoute = route;
          Object.assign(params, routeParams);
          break;
        }
      }
    }

    const generator = routeToBreadcrumb[matchedRoute];
    return generator ? generator(params) : [{ label: 'Page Not Found', current: true }];
  }, [location.pathname, items]);

  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            
            {item.current ? (
              <span 
                className="text-gray-500 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href || '#'}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm"
                aria-label={`Go to ${item.label}`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;