'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from './LoadingProvider';

/**
 * NavigationHandler component - Internal logic to detect route changes
 * Must be wrapped in Suspense because of useSearchParams()
 */
function NavigationHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsNavigating, setLoadingText } = useLoading();

  // Convert searchParams to string to have a stable dependency
  const searchParamsString = searchParams.toString();

  // Hide loader when route changes (navigation finishes)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParamsString, setIsNavigating]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Find the closest anchor tag
      const anchor = target.closest('a');

      // 1. Ignore if no anchor found
      if (!anchor) return;

      // 2. Ignore external links or special targets
      if (
        anchor.target === '_blank' || 
        anchor.rel?.includes('external') ||
        !anchor.href ||
        anchor.href.startsWith('mailto:') ||
        anchor.href.startsWith('tel:') ||
        anchor.href.startsWith('sms:')
      ) {
        return;
      }

      // 3. Ignore if modifier keys are pressed (open in new tab/window)
      if (event.ctrlKey || event.shiftKey || event.metaKey || event.altKey) {
        return;
      }

      // 4. Check if it's an internal link
      const href = anchor.getAttribute('href');
      if (!href) return;

      const isRelative = href.startsWith('/') && !href.startsWith('//');
      const isInternal = isRelative || href.startsWith(window.location.origin);
      
      if (!isInternal) return;

      try {
        const url = new URL(anchor.href);
        
        // Check if it's the same page (to avoid showing loader for same-page clicks)
        const isSamePage = 
          url.pathname === window.location.pathname && 
          url.search === window.location.search;
          
        // Check if it's just a hash change on the same page
        const isHashChange = isSamePage && url.hash !== window.location.hash;

        if (!isHashChange && !isSamePage) {
          setLoadingText('Đang chuyển hướng...');
          setIsNavigating(true);
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    };

    // Listen for click events globally
    document.addEventListener('click', handleAnchorClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      setIsNavigating(false);
    };
  }, [pathname, searchParamsString, setIsNavigating, setLoadingText]);

  return null;
}

/**
 * Global Navigation Events component
 * Automatically shows BallLoader on route changes
 */
export default function NavigationEvents() {
  return (
    <Suspense fallback={null}>
      <NavigationHandler />
    </Suspense>
  );
}
