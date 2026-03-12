import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuthEvent } from '@/app/actions/auth-log-action';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error, data: authData } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && authData.user) {
      // Detach logging to background
      logAuthEvent(authData.user.id, 'google_login').catch(() => {});

      const targetUrl = next.startsWith('http') ? new URL(next).pathname : next;
      
      // Removed the forced redirect to /onboarding/profile
      const response = NextResponse.redirect(new URL(targetUrl || '/', request.url));
      
      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
}
