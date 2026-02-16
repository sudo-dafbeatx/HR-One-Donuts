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

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Menu Produk', href: '/admin/products', icon: ArchiveBoxIcon },
  { name: 'Kustom Konten', href: '/admin/content', icon: PaintBrushIcon },
  { name: 'Theme & Teks', href: '/admin/theme', icon: SparklesIcon },
  { name: 'Visual Editor (Live Site)', href: '/', icon: SparklesIcon },
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
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer from LEFT */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-6 flex flex-col transition-transform duration-300 transform translate-x-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <LogoBrand 
                  logoUrl={logo_url} 
                  storeName={storeName} 
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-800 tracking-tighter">Admin <span className="text-primary">Menu</span></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{userEmail?.split('@')[0]}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-slate-500 hover:text-primary hover:bg-blue-50"
                    }`}
                  >
                    <item.icon className="size-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <Link 
                href="/" 
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-primary hover:bg-blue-50 transition-all"
              >
                <ArrowTopRightOnSquareIcon className="size-5" />
                Lihat Live Site
              </Link>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all w-full text-left"
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
