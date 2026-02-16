import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { 
  ArrowTopRightOnSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import AdminMobileNav from '@/components/admin/AdminMobileNav';
import AdminSidebar from '@/components/admin/AdminSidebar';
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
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // Fetch site settings for branding
  const { data: siteInfo } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = siteInfo?.value as unknown as SiteSettings | undefined;
  const siteLogo = siteSettings?.site_logo;
  const storeName = siteSettings?.store_name || "HR-One Donuts";

  const handleSignOut = async () => {
    'use server';
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Sidebar */}
      <AdminSidebar 
        userEmail={user.email || undefined} 
        siteLogo={siteLogo}
        storeName={storeName}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-16 flex items-center shrink-0">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            {/* Mobile Nav Button & Title */}
            <div className="flex items-center gap-4">
              <AdminMobileNav 
                userEmail={user.email || undefined} 
                siteLogo={siteLogo}
                storeName={storeName}
              />
              
              <div className="flex flex-col md:hidden">
                <span className="text-base font-black text-slate-800 tracking-tighter leading-tight">
                  {storeName.split(' ')[0]} <span className="text-primary">{storeName.split(' ').slice(1).join(' ')}</span>
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Admin</span>
              </div>
            </div>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                target="_blank"
                className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors pr-4 border-r border-slate-100"
              >
                <ArrowTopRightOnSquareIcon className="size-4" />
                Live Site
              </Link>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">{user.email?.split('@')[0]}</span>
                  <span className="text-[9px] font-medium text-slate-400">Admin</span>
                </div>
                <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserCircleIcon className="size-5" />
                </div>
                <form action={handleSignOut} className="hidden md:block">
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group">
                    <ArrowRightOnRectangleIcon className="size-4 group-hover:translate-x-0.5 transition-transform" title="Logout" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
