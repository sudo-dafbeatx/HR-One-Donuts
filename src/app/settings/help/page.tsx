'use client';

import { useState } from 'react';
import { 
  QuestionMarkCircleIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Bagaimana cara memesan donat?",
      a: "Anda dapat melihat katalog kami di menu 'Menu', pilih donat yang Anda inginkan, tambahkan ke keranjang, lalu klik 'Pesan via WhatsApp'."
    },
    {
      q: "Berapa lama waktu pengantaran?",
      a: "Pengantaran biasanya dilakukan antara pukul 08:00 - 17:00. Estimasi sampai tergantung jarak tempuh dan antrean."
    },
    {
      q: "Apakah ada minimum pemesanan?",
      a: "Tidak ada minimum pemesanan untuk eceran, namun untuk paket box tersedia dalam isi 6 atau 12."
    },
    {
      q: "Area mana saja yang dijangkau?",
      a: "Saat ini kami fokus pada area Bogor dan sekitarnya. Silakan cek detail pengiriman di menu 'Pengiriman'."
    },
    {
      q: "Metode pembayaran apa saja yang tersedia?",
      a: "Kami menerima Transfer Bank (BCA, Mandiri) dan E-Wallet (Gopay, Dana, OVO) yang dikonfirmasi melalui WhatsApp."
    }
  ];

  return (
    <div className="space-y-6 px-4 py-8 pb-32">
      <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm text-center mb-8">
        <div className="size-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <QuestionMarkCircleIcon className="size-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Pusat Bantuan</h2>
        <p className="text-sm text-slate-500 font-medium">Ada yang bisa kami bantu hari ini?</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all shadow-sm">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-700 leading-tight pr-4">{faq.q}</span>
              <ChevronDownIcon className={`size-4 text-slate-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-t border-slate-50 pt-4">
                   {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <section className="mt-12 space-y-4">
        <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Masih Butuh Bantuan?</h3>
        <div className="grid grid-cols-3 gap-3">
           <ContactCard icon={ChatBubbleLeftEllipsisIcon} label="Chat" href="#" color="primary" />
           <ContactCard icon={EnvelopeIcon} label="Email" href="mailto:halo@hrone.com" color="blue" />
           <ContactCard icon={PhoneIcon} label="WA" href="https://wa.me/6285810658117" color="green" />
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon: Icon, label, href, color }: { icon: React.ElementType, label: string, href: string, color: 'primary' | 'blue' | 'green' }) {
  const colors: Record<'primary' | 'blue' | 'green', string> = {
    primary: 'bg-primary/5 text-primary border-primary/10',
    blue: 'bg-blue-50 text-blue-500 border-blue-100',
    green: 'bg-green-50 text-green-500 border-green-100'
  };

  return (
    <a 
      href={href}
      className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all hover:scale-105 active:scale-95 ${colors[color]}`}
    >
      <Icon className="size-6 mb-2" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </a>
  );
}
