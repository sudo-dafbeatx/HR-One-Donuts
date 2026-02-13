import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { 
  HomeIcon, 
  ArchiveBoxIcon, 
  PaintBrushIcon, 
  ArrowTopRightOnSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import AdminMobileNav from '@/components/admin/AdminMobileNav';

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

  const handleSignOut = async () => {
    'use server';
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 sm:gap-10">
              <AdminMobileNav userEmail={user.email || undefined} />
              
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-slate-800 tracking-tighter leading-tight">HR-One <span className="text-primary">Donuts</span></span>
                <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Administrator</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                {[
                  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
                  { name: 'Menu Produk', href: '/admin/products', icon: ArchiveBoxIcon },
                  { name: 'Kustom Konten', href: '/admin/content', icon: PaintBrushIcon },
                ].map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-primary hover:bg-blue-50 transition-all"
                  >
                    <item.icon className="size-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                target="_blank"
                className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors pr-6 border-r border-slate-100"
              >
                <ArrowTopRightOnSquareIcon className="size-4" />
                Live Site
              </Link>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">{user.email?.split('@')[0]}</span>
                  <span className="text-[9px] font-medium text-slate-400">Admin Utama</span>
                </div>
                <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserCircleIcon className="size-5" />
                </div>
                <form action={handleSignOut}>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group">
                    <ArrowRightOnRectangleIcon className="size-4 group-hover:translate-x-0.5 transition-transform" title="Logout" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[72px] sm:pt-20 pb-20">
        {children}
      </main>
    </div>
  );
}
