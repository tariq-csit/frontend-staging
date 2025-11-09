import { useNavigate, useLocation } from 'react-router-dom';

// Function to validate if a URL is same-origin
const isSameOrigin = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Hook to handle post-authentication redirects
 * Reads redirecturi parameter from URL and redirects after successful authentication
 */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = () => {
    let targetUrl = '/dashboard'; // Default redirect

    // Get redirecturi from URL search parameters
    const urlParams = new URLSearchParams(location.search);
    const redirectUri = urlParams.get('redirecturi');

    if (redirectUri && isSameOrigin(redirectUri)) {
      targetUrl = redirectUri;
    }

    navigate(targetUrl, { replace: true });
  };

  return { redirectTo };
}