'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LogoBrand from '@/components/ui/LogoBrand';
import { createClient } from '@/lib/supabase/client';
import { 
  HomeIcon, 
  ArchiveBoxIcon, 
  PaintBrushIcon, 
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navGroups = [
  {
    title: 'MENU UTAMA',
    items: [
      { name: 'Dashboard', href: '/admin', icon: HomeIcon },
      { name: 'Menu Produk', href: '/admin/products', icon: ArchiveBoxIcon },
    ]
  },
  {
    title: 'WEBSITE',
    items: [
      { name: 'Kustom Konten', href: '/admin/content', icon: PaintBrushIcon },
      { name: 'Theme & Teks', href: '/admin/theme', icon: SparklesIcon },
      { name: 'Lihat Live Site', href: '/', icon: ArrowTopRightOnSquareIcon, external: true },
    ]
  }
];

export default function AdminSidebar({ userEmail, logo_url, storeName }: { userEmail?: string; logo_url?: string; storeName?: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-[290px] bg-[#1C2434] fixed inset-y-0 left-0 z-50 transition-all duration-300">
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Logo Section */}
        <div className="p-6 pb-10">
          <Link href="/admin" className="flex items-center gap-3 group">
            <LogoBrand 
              logoUrl={logo_url} 
              storeName={storeName} 
              size="sm"
              className="brightness-0 invert group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-tight">Admin <span className="text-[#3C50E0]">Panel</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Administrator</span>
            </div>
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 px-6 space-y-8">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] px-4">
                {group.title}
              </h3>
              <nav className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      target={item.external ? "_blank" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive 
                          ? "bg-[#333A48] text-white" 
                          : "text-slate-400 hover:text-white hover:bg-[#333A48]"
                      }`}
                    >
                      <item.icon className={`size-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User & Logout Section */}
        <div className="p-6 mt-auto border-t border-slate-700/50 bg-[#1C2434]">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-[#24303F]">
            <div className="size-10 rounded-full bg-[#3C50E0] flex items-center justify-center text-white font-black text-xs uppercase">
              {userEmail?.[0] || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{userEmail?.split('@')[0]}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Administrator</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-[#333A48] transition-all w-full text-left"
          >
            <ArrowRightOnRectangleIcon className="size-5" />
            Keluar Sistem
          </button>
        </div>
      </div>
    </aside>
  );
}
