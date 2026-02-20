'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  Cog8ToothIcon, 
  QuestionMarkCircleIcon, 
  ArrowRightOnRectangleIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { useState } from 'react';


interface AdminHeaderProps {
  userEmail?: string;
  onMenuToggle: () => void;
}

export default function AdminHeader({ userEmail, onMenuToggle }: AdminHeaderProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const username = userEmail ? userEmail.split('@')[0] : 'Admin';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-[70px] bg-white shadow-[0_0_28px_0_rgba(82,63,105,0.08)] z-40 flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuToggle}
          className="p-2 lg:hidden text-slate-800 hover:text-[#1b00ff] transition-colors"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Here"
            className="border-none bg-transparent text-sm w-96 focus:ring-0 placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button 
          className="md:hidden p-2 text-slate-800 hover:text-[#1b00ff] transition-colors"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-800 hover:text-[#1b00ff] transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1b00ff] rounded-full animate-pulse"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {username}
            </span>
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-50">
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1b00ff] transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <UserIcon className="w-4 h-4" /> Profile
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1b00ff] transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Cog8ToothIcon className="w-4 h-4" /> Setting
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1b00ff] transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <QuestionMarkCircleIcon className="w-4 h-4" /> Help
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1b00ff] transition-colors w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white p-4 shadow-md md:hidden flex items-center gap-2 z-50 border-t border-slate-100">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Here"
            className="border-none bg-transparent text-sm w-full focus:ring-0 placeholder:text-slate-400 outline-none"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
