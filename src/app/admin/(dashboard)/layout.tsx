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
  const logo_url = siteSettings?.logo_url;
  const storeName = siteSettings?.store_name || "HR-One Donuts";

  const handleSignOut = async () => {
    'use server';
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      {/* Desktop Sidebar */}
      <AdminSidebar 
        userEmail={user.email || undefined} 
        logo_url={logo_url}
        storeName={storeName}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-[290px]">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-20 flex items-center shrink-0 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            {/* Mobile Nav Button */}
            <div className="flex items-center gap-4">
              <AdminMobileNav 
                userEmail={user.email || undefined} 
                logo_url={logo_url}
                storeName={storeName}
              />
              
              {/* Search Bar - Hidden on mobile, streamlined for desktop */}
              <div className="hidden md:block relative group">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pl-3">search</span>
                <input 
                  type="text" 
                  placeholder="Cari fitur atau data..."
                  className="bg-transparent border-none py-2 pl-12 pr-4 outline-none text-sm w-64 lg:w-96 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                <Link 
                  href="/" 
                  target="_blank"
                  className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-all"
                  title="Lihat Situs Utama"
                >
                  <ArrowTopRightOnSquareIcon className="size-5" />
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[150px]">{user.email?.split('@')[0]}</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none mt-0.5">Administrator</span>
                </div>
                <div className="size-11 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 relative">
                  <UserCircleIcon className="size-7" />
                  <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <form action={handleSignOut} className="hidden md:block">
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Keluar">
                    <ArrowRightOnRectangleIcon className="size-5" />
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
