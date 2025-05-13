import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

/**
 * Hook to set the page title based on the current route
 * @param suffix Optional suffix to append to the title (e.g., "| SLASH")
 */
export const usePageTitle = (suffix: string = "| SLASH") => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    // Define route patterns and their corresponding titles
    const routes = [
      { pattern: '/', title: 'Home' },
      { pattern: '/login', title: 'Login' },
      { pattern: '/signup', title: 'Sign Up' },
      { pattern: '/forgot-password', title: 'Forgot Password' },
      { pattern: '/reset-password/:token', title: 'Reset Password' },
      { pattern: '/dashboard', title: 'Dashboard' },
      { pattern: '/pentests', title: 'Pentests' },
      { pattern: '/pentests/create', title: 'Create Pentest' },
      { pattern: '/pentests/:pentestId', title: 'Pentest Details' },
      { pattern: '/pentests/:pentestId/edit', title: 'Edit Pentest' },
      { pattern: '/pentests/:pentestId/vulnerabilities', title: 'Vulnerabilities' },
      { pattern: '/pentests/:pentestId/manage-report', title: 'Manage Report' },
      { pattern: '/pentests/:pentestId/pentest-report', title: 'Pentest Report' },
      { pattern: '/pentests/:pentestId/retest-report', title: 'Retest Report' },
      { pattern: '/vulnerability-reports', title: 'Vulnerability Reports' },
      { pattern: '/vulnerability-reports/:pentestId', title: 'Vulnerability Reports' },
      { pattern: '/vulnerability-reports/:pentestId/create', title: 'Create Vulnerability Report' },
      { pattern: '/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId', title: 'Vulnerability Details' },
      { pattern: '/vulnerability-reports/:pentestId/vulnerabilities/:vulnerabilityId/edit', title: 'Edit Vulnerability' },
      { pattern: '/clients', title: 'Clients' },
      { pattern: '/clients/users', title: 'Client Users' },
      { pattern: '/pentesters', title: 'Pentesters' },
      { pattern: '/settings', title: 'Settings' },
    ];
    
    // Find matching route
    let title = 'SLASH';
    for (const route of routes) {
      const match = matchPath(route.pattern, path);
      if (match) {
        title = route.title;
        break;
      }
    }
    
    // If no specific match was found, try to create a title from the path
    if (title === 'SLASH') {
      const segment = path.split('/').filter(Boolean).pop() || '';
      if (segment) {
        title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }
    }
    
    // Set the document title
    document.title = `${title} ${suffix}`;
    
    // Cleanup function
    return () => {
      document.title = 'SLASH';
    };
  }, [location, suffix]);
}; 