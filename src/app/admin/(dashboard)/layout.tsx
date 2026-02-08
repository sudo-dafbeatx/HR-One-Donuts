import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import Link from 'next/link';

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

  const handleSignOut = async () => {
    'use server';
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    redirect('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-black text-heading">HR-One Donuts</h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/admin" 
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/products" 
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
            >
              Produk
            </Link>
            <Link 
              href="/admin/content" 
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
            >
              Konten
            </Link>
            <Link 
              href="/" 
              target="_blank"
              className="text-sm text-slate-400 hover:text-primary transition-colors border-l border-slate-200 pl-6"
            >
              View Site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              {user.email}
            </div>
            <form action={handleSignOut}>
              <button className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
