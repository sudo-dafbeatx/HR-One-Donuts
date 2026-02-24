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
      // Log Google Login (or other OAuth) event asynchronously
      logAuthEvent(authData.user.id, 'google_login').catch(console.error);

      // Check if profile is complete
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_profile_complete')
        .eq('id', authData.user.id)
        .maybeSingle();

      const isSecure = process.env.NODE_ENV === 'production';
      const redirectUrl = !profile?.is_profile_complete ? '/onboarding/profile' : next;
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      
      // Sync cookie if complete so middleware allows pass
      if (profile?.is_profile_complete) {
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
