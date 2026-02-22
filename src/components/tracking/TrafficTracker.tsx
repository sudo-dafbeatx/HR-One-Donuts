'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logTraffic } from '@/app/actions/traffic-actions';
export default function TrafficTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Log the page view anonymously to avoid auth refresh calls on public pages.
        // If a user_id is strictly needed, it should be retrieved from a session-aware context
        // only on guarded routes.
        await logTraffic({
          event_type: 'page_view',
          path: pathname,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        });
      } catch (err) {
        // Silently ignore tracking errors to avoid disrupting user experience
        console.warn('[TrafficTracker] Failed to log page view:', err);
      }
    };

    trackPageView();
  }, [pathname]);

  return null; // This component doesn't render anything
}
