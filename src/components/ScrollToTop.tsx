import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    // Use multiple methods to ensure scroll works across different scenarios

    // Method 1: Immediate scroll for instant feedback
    window.scrollTo(0, 0);

    // Method 2: Smooth scroll after a brief delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
      });
    }, 100);

    // Method 3: Fallback for browsers that don't support smooth scrolling
    const fallbackTimeoutId = setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeoutId);
    };
  }, [pathname]);

  return null;
}
