'use client';

import Link from "next/link";
import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";
import { useTranslation } from "@/context/LanguageContext";

interface FooterProps {
  siteSettings?: SiteSettings;
}

export default function Footer({ siteSettings }: FooterProps) {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-slate-900 text-white pt-12 md:pt-20 pb-8 md:pb-10 overflow-hidden relative">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-20">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 md:space-y-8">
            <Link href="/" className="inline-block transition-all hover:scale-105 active:scale-95 group">
              <div className="bg-white p-2.5 md:p-3 rounded-3xl md:rounded-4xl shadow-xl shadow-black/20 group-hover:rotate-3 transition-transform">
                <LogoBrand 
                  logoUrl={siteSettings?.logo_url} 
                  storeName={siteSettings?.store_name} 
                  size="md"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xs font-medium">
              {siteSettings?.tagline || t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: 'photo_camera', label: 'Instagram', url: siteSettings?.instagram_url, color: 'hover:bg-pink-600' },
                { icon: 'videocam', label: 'TikTok', url: siteSettings?.tiktok_url, color: 'hover:bg-slate-800' },
              ].map((social, i) => social.url && (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`size-10 md:size-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 ${social.color} hover:text-white hover:border-transparent transition-all shadow-lg group`}
                  aria-label={social.label}
                >
                  <span className="material-symbols-outlined text-xl md:text-2xl group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi & Bantuan */}
          <div className="grid grid-cols-2 lg:col-span-2 gap-8">
            <div>
              <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-5 md:mb-8 opacity-50">
                {t('footer.navigation')}
              </h4>
              <ul className="space-y-3.5 md:space-y-4">
                {[
                  { label: t('nav.home'), path: '/' },
                  { label: t('nav.catalog'), path: '/catalog' },
                  { label: t('nav.events'), path: '/news' },
                  { label: t('nav.promo'), path: '/promo/birthday' }
                ].map((item) => (
                  <li key={item.path}>
                    <Link 
                      className="text-slate-400 hover:text-primary text-sm font-bold transition-all flex items-center gap-3 group" 
                      href={item.path}
                    >
                      <span className="size-1.5 bg-slate-800 rounded-full group-hover:bg-primary group-hover:scale-150 transition-all" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-5 md:mb-8 opacity-50">
                {t('footer.help')}
              </h4>
              <ul className="space-y-3.5 md:space-y-4">
                {[
                  { label: t('nav.how_to_order'), path: '/cara-pesan' },
                  { label: t('nav.faq'), path: '/faq' },
                  { label: 'Pengiriman', path: '/pengiriman' },
                  { label: t('nav.contact'), path: '/kontak' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link 
                      className="text-slate-400 hover:text-primary text-sm font-bold transition-all flex items-center gap-3 group" 
                      href={item.path}
                    >
                      <span className="size-1.5 bg-slate-800 rounded-full group-hover:bg-primary group-hover:scale-150 transition-all" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-2 text-center md:text-left opacity-50">
              {t('footer.contact_us')}
            </h4>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="size-10 md:size-11 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg md:text-xl">location_on</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">{t('footer.location')}</span>
                  <span className="text-slate-300 text-xs md:text-sm font-bold leading-snug">
                    {siteSettings?.address || "Jakarta, Indonesia"}
                  </span>
                </div>
              </div>

              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || '62895351251395'}`} className="flex items-start gap-4 group" target="_blank" rel="noopener noreferrer">
                <div className="size-10 md:size-11 rounded-xl md:rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg md:text-xl">chat</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">WhatsApp</span>
                  <span className="text-slate-300 text-xs md:text-sm font-black group-hover:text-green-500 transition-colors">
                    {process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || "62895351251395"}
                  </span>
                </div>
              </a>

              <a href={`mailto:${siteSettings?.email || 'heri.irawan.hr1@gmail.com'}`} className="flex items-start gap-4 group">
                <div className="size-10 md:size-11 rounded-xl md:rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-lg md:text-xl">mail</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">Email Support</span>
                  <span className="text-slate-300 text-xs md:text-sm font-bold group-hover:text-blue-500 transition-colors">
                    {siteSettings?.email || 'heri.irawan.hr1@gmail.com'}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <p className="text-slate-500 text-[10px] md:text-[11px] font-bold order-2 md:order-1 tracking-wider uppercase">
            {t('footer.copyright')}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-10 gap-y-3 md:gap-y-4 order-1 md:order-2">
            {[
              { label: t('footer.privacy'), href: '/privacy' },
              { label: t('footer.terms'), href: '/terms' },
              { label: t('footer.cookie'), href: '/cookies' }
            ].map((link) => (
              <Link 
                key={link.href}
                className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white transition-colors" 
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>


  );
}
