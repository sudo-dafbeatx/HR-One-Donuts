'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logTraffic } from '@/app/actions/traffic-actions';
import { createClient } from '@/lib/supabase/client';

export default function TrafficTracker() {
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Log the page view
        await logTraffic({
          event_type: 'page_view',
          path: pathname,
          user_id: user?.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        });
      } catch (err) {
        // Silently ignore tracking errors to avoid disrupting user experience
        console.warn('[TrafficTracker] Failed to log page view:', err);
      }
    };

    trackPageView();
  }, [pathname, supabase.auth]);

  return null; // This component doesn't render anything
}
