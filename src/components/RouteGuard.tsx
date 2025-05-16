import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, UserRole } from '@/hooks/useUser';

type RouteGuardProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

/**
 * RouteGuard component to protect routes based on user role
 * @param {ReactNode} children - The component to render if authentication passes
 * @param {UserRole[]} allowedRoles - Array of roles allowed to access this route
 */
const RouteGuard = ({ children, allowedRoles }: RouteGuardProps) => {
  const { user, loading, error } = useUser();
  const location = useLocation();

  // Show loading state if still fetching user data
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if error or no user found
  if (error || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is in the allowed roles list
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate default page based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'pentester':
        return <Navigate to="/dashboard" replace />;
      case 'client':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If role is allowed, render the protected component
  return <>{children}</>;
};

export default RouteGuard; 