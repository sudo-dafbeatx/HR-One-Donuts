'use client';

import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  userEmail?: string;
  logo_url?: string;
  storeName?: string;
}

export default function AdminLayoutWrapper({ 
  children, 
  userEmail, 
  logo_url, 
  storeName 
}: AdminLayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f4f8] font-sans text-[#1b00ff]">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen}
        userEmail={userEmail}
        logo_url={logo_url}
        storeName={storeName}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Header */}
      <AdminHeader 
        userEmail={userEmail} 
        onMenuToggle={() => setIsSidebarOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="pt-[70px] lg:pl-[280px] transition-all duration-300">
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
