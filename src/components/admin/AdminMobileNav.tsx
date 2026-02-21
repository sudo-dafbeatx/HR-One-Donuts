'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoBrand from '@/components/ui/LogoBrand';
import { 
  Bars3Icon, 
  XMarkIcon,
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

export default function AdminMobileNav({ userEmail, logo_url, storeName }: { userEmail?: string; logo_url?: string; storeName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const supabase = createClient();
  const router = useRouter();

  // Close when pathname changes (Derived State Adjustment pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bars3Icon className="size-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer from LEFT */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 bg-[#1C2434] shadow-2xl p-6 flex flex-col transition-transform duration-300 transform translate-x-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <LogoBrand 
                  logoUrl={logo_url} 
                  storeName={storeName} 
                  size="sm"
                  className="brightness-0 invert"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white tracking-tighter">Admin <span className="text-[#3C50E0]">Panel</span></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Administrator</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-[#333A48] rounded-lg transition-all"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] px-4">
                    {group.title}
                  </h3>
                  <div className="space-y-1.5">
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
                  </div>
                </div>
              ))}
            </nav>
            
            <div className="pt-6 mt-auto border-t border-slate-700/50">
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-[#24303F]">
                <div className="size-10 rounded-full bg-[#3C50E0] flex items-center justify-center text-white font-black text-xs uppercase">
                  {userEmail?.[0] || 'A'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white truncate">{userEmail?.split('@')[0]}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Admin Utama</span>
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
        </div>
      )}
    </div>
  );
}
