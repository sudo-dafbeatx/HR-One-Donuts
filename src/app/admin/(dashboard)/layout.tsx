import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceRoleClient } from '../../../lib/supabase/server';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';
import { SiteSettings } from '@/types/cms';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin_session cookie (set by /api/admin/login)
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const adminUser = cookieStore.get('admin_user');

  if (!adminSession?.value) {
    redirect('/admin/login');
  }

  // Fetch site settings for branding (using service-independent query)
  const supabase = createServiceRoleClient();

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
      userEmail={adminUser?.value || 'admin'}
      logo_url={logo_url}
      storeName={storeName}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
