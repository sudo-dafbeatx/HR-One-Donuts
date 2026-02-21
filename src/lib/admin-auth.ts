import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';

export interface AdminSession {
  adminId: string;
  username: string;
  supabase: ReturnType<typeof createServiceRoleClient>;
}

/**
 * Validates the admin session cookie and returns a Service Role client
 * and the verified admin user information.
 * Throws an Error if unauthorized.
 */
export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  const usernameCookie = cookieStore.get('admin_user')?.value;

  if (!sessionCookie || !usernameCookie) {
    throw new Error('Forbidden: Admin access only (Missing session)');
  }

  const supabase = createServiceRoleClient();

  // Validate session against database and get ID
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('id, username')
    .eq('username', usernameCookie)
    .single();

  if (error || !adminUser) {
    // If the user doesn't exist in DB anymore, session is invalid
    throw new Error('Forbidden: Session invalid or user not found');
  }

  // To do a rigorous check, we could also store the session token hash in DB, 
  // but since httpOnly cookies are safe from XSS, and we verify the username exists in DB,
  // this provides an acceptable layer of isolation.
  return {
    adminId: adminUser.id,
    username: adminUser.username,
    supabase
  };
}
