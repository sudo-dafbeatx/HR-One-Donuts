'use client';

import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';

export default function AppInfoPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 px-4 py-12 pb-32 text-center">
      <div className="relative size-32 mx-auto mb-6 group">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
        <div className="relative size-full bg-white rounded-full border-8 border-white shadow-xl flex items-center justify-center p-6">
           <div className="relative size-full">
             <Image 
               src="/images/logo-hr-one.webp"
               alt="HR-One Donuts"
               fill
               className="object-contain"
             />
           </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800">HR-One Donuts</h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full">
          <RocketLaunchIcon className="size-4" />
          <span className="text-xs font-black uppercase tracking-widest">Web App v1 Beta 1.1</span>
        </div>
      </div>

      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto italic">
      {t('settings.info.tagline')}
      </p>

      <div className="pt-12">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 divide-y divide-slate-50 shadow-sm">
           <div className="flex justify-between py-3">
              <span className="text-xs font-bold text-slate-400 uppercase">{t('settings.info.fields.vendor')}</span>
              <span className="text-xs font-black text-slate-800">Google Antigravity & DAFBEATX</span>
           </div>
           <div className="flex justify-between py-3">
              <span className="text-xs font-bold text-slate-400 uppercase">{t('settings.info.fields.database')}</span>
              <span className="text-xs font-black text-slate-800">Supabase</span>
           </div>
           <div className="flex justify-between py-3">
              <span className="text-xs font-bold text-slate-400 uppercase">{t('settings.info.fields.framework')}</span>
              <span className="text-xs font-black text-slate-800">Next.js 14</span>
           </div>
        </div>
        <p className="mt-8 text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t('settings.info.footer')}</p>
      </div>
    </div>
  );
}
