'use server';

import { revalidatePath } from 'next/cache';

// Force logout is now handled by the API route /api/admin/force-logout
// which uses the Supabase Admin REST API directly with the service role key.
// This file retains other admin server actions.

export async function revalidateAdminUsers() {
  revalidatePath('/admin/users');
}
