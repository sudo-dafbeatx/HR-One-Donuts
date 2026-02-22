'use client';

import { useState } from 'react';
import { 
  DocumentTextIcon, 
  ChevronRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import { createClient } from '@/lib/supabase/client';

export default function PoliciesPage() {
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const handleSatisfaction = async (type: 'happy' | 'sad') => {
    setSubmitted(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('article_satisfaction').insert({
      user_id: user?.id || null,
      article_id: 'policies_main',
      is_satisfied: type === 'happy'
    });
  };

  const policies = [
    { label: "Syarat Layanan", href: "/terms#syarat-layanan" },
    { label: "Kebijakan Privasi HR-One Donuts", href: "/privacy#kebijakan-privasi" },
    { label: "Kebijakan Privasi (Detail Pengumpulan Data)", href: "/privacy#pengelolaan-data" },
    { label: "Persyaratan Layanan Event Ulang Tahun", href: "/terms#event-ulang-tahun" },
    { label: "Persyaratan Flash Sale: SMS", href: "/terms#flash-sale" },
    { label: "Persyaratan Flash Sale: Jum'at Berkah", href: "/terms#flash-sale" },
    { label: "Ketentuan Donat Box", href: "/terms#ketentuan-donat-box" },
    { label: "Ketentuan Donat Eceran", href: "/terms#ketentuan-donat-eceran" }
  ];

  return (
    <div className="space-y-6 px-4 py-8 pb-32">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
        {policies.map((policy, idx) => (
          <a 
            key={idx} 
            href={policy.href}
            className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                <DocumentTextIcon className="size-5" />
              </div>
              <span className="text-sm font-bold text-slate-700">{policy.label}</span>
            </div>
            <ChevronRightIcon className="size-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </a>
        ))}
      </div>

      <section className="bg-white rounded-4xl p-10 shadow-sm border border-slate-100 text-center animate-in fade-in duration-500">
        <h3 className="text-lg font-black text-slate-800 mb-2">Apakah kamu puas dengan artikelnya?</h3>
        <p className="text-sm text-slate-500 font-medium mb-8">Masukanmu sangat berarti bagi kami.</p>
        
        {submitted ? (
           <div className="animate-in zoom-in duration-300">
              <div className="size-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandThumbUpSolid className="size-8" />
              </div>
              <p className="text-sm font-bold text-slate-800">Terima kasih atas masukannya!</p>
           </div>
        ) : (
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => handleSatisfaction('happy')}
              className="flex flex-col items-center gap-3 px-8 py-4 rounded-3xl border-2 border-slate-50 hover:border-primary/20 hover:bg-primary/5 transition-all group"
            >
              <HandThumbUpIcon className="size-8 text-slate-300 group-hover:text-primary transition-colors" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-primary">Puas</span>
            </button>
            <button 
              onClick={() => handleSatisfaction('sad')}
              className="flex flex-col items-center gap-3 px-8 py-4 rounded-3xl border-2 border-slate-50 hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <HandThumbDownIcon className="size-8 text-slate-300 group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-red-500">Kurang Puas</span>
            </button>
          </div>
        )}
      </section>

      <div className="pt-8 space-y-4">
         <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hubungi Kami</p>
         <div className="space-y-2">
            <ContactLink label="Chat Sistem" href="#" onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new Event('open_dona_chat'));
            }} />
            <ContactLink label="Email: Heri.irawan.hr1@gmail.com" href="mailto:Heri.irawan.hr1@gmail.com" />
            <ContactLink label="WhatsApp: +62 858-1065-8117" href="https://wa.me/6285810658117" />
         </div>
      </div>
    </div>
  );
}

function ContactLink({ label, href, onClick }: { label: string, href: string, onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a 
      href={href}
      onClick={onClick}
      className="flex items-center justify-center py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
    >
      {label}
    </a>
  );
}
