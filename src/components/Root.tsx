import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Root = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in - you can replace this with your actual auth check
    const token = localStorage.getItem('token'); // or however you store your auth token

    if (token) {
      // If logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // If not logged in, redirect to login with redirecturi parameter
      const currentPath = location.pathname + location.search + location.hash;
      // Only redirect if current path is not already login or signup
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
        navigate(`/login?redirecturi=${encodeURIComponent(currentPath)}`);
      } else {
        navigate('/login');
      }
    }
  }, [navigate, location]);

  return null; // This component doesn't render anything
};

export default Root; 
