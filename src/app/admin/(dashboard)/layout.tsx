import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { SiteSettings } from '@/types/cms';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/admin/login');
  }

  // Check user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin') {
    if (profileError) console.error(' [AdminLayout] Profile check error:', profileError);
    redirect('/');
  }

  // Fetch site settings for branding
  const { data: siteInfo } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = siteInfo?.value as unknown as SiteSettings | undefined;
  const logo_url = siteSettings?.logo_url || '/images/logo-hr-one.webp';
  const storeName = siteSettings?.store_name || "HR-One Donuts";

  return (
    <AdminLayoutWrapper 
      userEmail={user?.email || undefined}
      logo_url={logo_url}
      storeName={storeName}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
