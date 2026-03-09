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

      // Fetch user profile status
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_profile_complete')
        .eq('id', authData.user.id)
        .maybeSingle();

      const isSecure = process.env.NODE_ENV === 'production';
      // If profile exists and is complete, go to next, otherwise onboarding
      const isComplete = profile?.is_profile_complete === true;
      const redirectUrl = isComplete ? next : '/onboarding/profile';
      
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      
      if (isComplete) {
        response.cookies.set('hr_profile_complete', 'true', {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
          secure: isSecure,
        });
      }

      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
}
