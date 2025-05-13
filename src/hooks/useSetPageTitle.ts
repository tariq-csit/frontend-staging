import { useEffect } from 'react';

/**
 * Hook to set a specific page title from a component
 * Useful for dynamic titles based on data fetched in components
 * 
 * @param title The specific title to set
 * @param suffix Optional suffix to append to the title (e.g., "| SLASH")
 */
export const useSetPageTitle = (title: string, suffix: string = "| SLASH") => {
  useEffect(() => {
    // Only update if we have a title
    if (title) {
      document.title = `${title} ${suffix}`;
    }
    
    // Cleanup - don't reset the title here to avoid flashing
    return () => {};
  }, [title, suffix]);
}; 