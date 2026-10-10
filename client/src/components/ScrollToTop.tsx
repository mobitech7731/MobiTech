import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Only intercept PUSH and REPLACE navigations (new page visits).
    // Let the browser/ScrollRestoration handle POP (back/forward) naturally.
    if (navigationType !== 'POP') {
      const state = location.state as { preventScrollReset?: boolean } | null;
      
      if (!state?.preventScrollReset) {
        // Use a tiny timeout to ensure it runs after React has flushed DOM updates
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }
    }
  }, [location, navigationType]);

  return null;
}
