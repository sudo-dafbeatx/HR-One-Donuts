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
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const navGroups = [
  {
    title: 'MENU UTAMA',
    items: [
      { name: 'Dashboard', href: '/admin', icon: HomeIcon },
      { name: 'Menu Produk', href: '/admin/products', icon: ArchiveBoxIcon },
      { name: 'Manajemen Pengguna', href: '/admin/users', icon: UserGroupIcon },
    ]
  },
  {
    title: 'WEBSITE',
    items: [
      { name: 'Kustom Konten', href: '/admin/content', icon: PaintBrushIcon },
      { name: 'Theme & Teks', href: '/admin/theme', icon: SparklesIcon },
      { name: 'Latih Chat Bot', href: '/admin/bot-training', icon: ChatBubbleLeftRightIcon },
      { name: 'Lihat Live Site', href: '/', icon: ArrowTopRightOnSquareIcon, external: true },
    ]
  }
];

interface AdminSidebarProps {
  userEmail?: string;
  logo_url?: string;
  storeName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ logo_url, storeName, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear admin session cookie first
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#1C2434] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 pb-10">
          <Link href="/admin" className="flex items-center gap-3 group">
            <LogoBrand 
              logoUrl={logo_url} 
              storeName={storeName} 
              size="sm"
              className="brightness-0 invert group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-tight">Admin <span className="text-[#1b00ff]">Panel</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Administrator</span>
            </div>
          </Link>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 px-4 space-y-8">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] px-2">
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
                          ? "bg-[#1b00ff] text-white shadow-lg shadow-[#1b00ff]/20" 
                          : "text-slate-400 hover:text-white hover:bg-[#333A48]"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User & Logout Section */}
        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-all text-center"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Keluar Sistem
          </button>
        </div>
      </div>
    </aside>
  );
}
