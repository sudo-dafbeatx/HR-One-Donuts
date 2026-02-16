'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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
];

export default function AdminMobileNav({ userEmail }: { userEmail?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bars3Icon className="size-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 animate-slide-in-right"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-800 tracking-tighter">Admin <span className="text-primary">Menu</span></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userEmail?.split('@')[0]}</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
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
              
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                <Link 
                  href="/" 
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-primary hover:bg-blue-50 transition-all"
                >
                  <ArrowTopRightOnSquareIcon className="size-5" />
                  Lihat Website Live
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="size-5" />
                  Keluar Sistem
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
