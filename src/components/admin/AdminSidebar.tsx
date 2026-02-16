'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
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

export default function AdminSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-50">
      <div className="p-6">
        <div className="flex flex-col mb-10">
          <span className="text-xl font-black text-slate-800 tracking-tighter leading-tight">HR-One <span className="text-primary">Donuts</span></span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Administrator</span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:text-primary hover:bg-blue-50"
                }`}
              >
                <item.icon className="size-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-2 border-t border-slate-100">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-primary hover:bg-blue-50 transition-all"
        >
          <ArrowTopRightOnSquareIcon className="size-4" />
          Lihat Live Site
        </Link>
        
        <div className="pt-2 px-4 flex flex-col mb-4">
          <span className="text-[10px] font-bold text-slate-800 truncate">{userEmail?.split('@')[0]}</span>
          <span className="text-[9px] font-medium text-slate-400">Admin Utama</span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all w-full text-left"
        >
          <ArrowRightOnRectangleIcon className="size-4" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
