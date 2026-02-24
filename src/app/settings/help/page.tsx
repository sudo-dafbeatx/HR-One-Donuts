'use client';


import { useState } from 'react';
import { 
  QuestionMarkCircleIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/context/LanguageContext';

export default function FAQPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: t('settings.help.faqs.0.q'),
      a: t('settings.help.faqs.0.a')
    },
    {
      q: t('settings.help.faqs.1.q'),
      a: t('settings.help.faqs.1.a')
    },
    {
      q: t('settings.help.faqs.2.q'),
      a: t('settings.help.faqs.2.a')
    },
    {
      q: t('settings.help.faqs.3.q'),
      a: t('settings.help.faqs.3.a')
    },
    {
      q: t('settings.help.faqs.4.q'),
      a: t('settings.help.faqs.4.a')
    }
  ];

  return (
    <div className="space-y-6 px-4 py-8 pb-32">
      <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm text-center mb-8">
        <div className="size-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <QuestionMarkCircleIcon className="size-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">{t('settings.help.title')}</h2>
        <p className="text-sm text-slate-500 font-medium">{t('settings.help.subtitle')}</p>
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
        <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('settings.help.contact_cta')}</h3>
        <div className="grid grid-cols-3 gap-3">
           <ContactCard icon={ChatBubbleLeftEllipsisIcon} label="Chat Sistem" href="/settings/help/chat" color="primary" />
           <ContactCard icon={EnvelopeIcon} label="Email" href="mailto:heri.irawan.hr1@gmail.com" color="blue" />
           <ContactCard icon={PhoneIcon} label="WA" href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || '62895351251395'}`} color="green" />
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
