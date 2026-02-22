'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Settings Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="size-6 text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">Pengaturan</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {children}
      </div>
    </div>
  );
}
