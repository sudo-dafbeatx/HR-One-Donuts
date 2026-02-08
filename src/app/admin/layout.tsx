import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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
            <h1 className="text-xl font-black text-heading">Donat Keluarga</h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              target="_blank"
              className="text-sm text-slate-600 hover:text-primary transition-colors"
            >
              View Website
            </Link>
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
