'use client';

import Link from 'next/link';
import { 
  UserIcon, 
  MapPinIcon, 
  BellIcon, 
  QuestionMarkCircleIcon, 
  DocumentTextIcon, 
  InformationCircleIcon, 
  TrashIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "hr_profile_complete=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/');
    router.refresh();
  };

  const sections = [
    {
      title: "Akun",
      items: [
        { label: "Keamanan dan Akun", href: "/settings/account", icon: UserIcon },
        { label: "Alamat Saya", href: "/settings/address", icon: MapPinIcon },
      ]
    },
    {
      title: "Pengaturan",
      items: [
        { label: "Preferensi & Privasi", href: "/settings/preferences", icon: BellIcon },
      ]
    },
    {
      title: "Bantuan",
      items: [
        { label: "Pusat Bantuan (FAQ)", href: "/settings/help", icon: QuestionMarkCircleIcon },
        { label: "Kebijakan", href: "/settings/policies", icon: DocumentTextIcon },
        { label: "Informasi Aplikasi", href: "/settings/info", icon: InformationCircleIcon },
        { label: "Ajukan Penghapusan Akun", href: "/settings/delete-account", icon: TrashIcon, variant: "danger" },
      ]
    }
  ];

  return (
    <div className="py-4 space-y-6">
      {sections.map((section, sIndex) => (
        <div key={sIndex} className="space-y-2">
          <h2 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {section.title}
          </h2>
          <div className="bg-white border-y border-slate-100 divide-y divide-slate-50">
            {section.items.map((item, iIndex) => (
              <Link 
                key={iIndex} 
                href={item.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${item.variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'} group-hover:scale-110 transition-transform`}>
                    <item.icon className="size-5" />
                  </div>
                  <span className={`text-sm font-medium ${item.variant === 'danger' ? 'text-red-500' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRightIcon className="size-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <div className="pt-4 pb-12 px-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-red-100 rounded-2xl text-red-500 font-bold text-sm shadow-sm active:scale-[0.98] transition-all hover:bg-red-50"
        >
          <ArrowRightOnRectangleIcon className="size-5" />
          Log Out / Ganti Akun
        </button>
      </div>
    </div>
  );
}
