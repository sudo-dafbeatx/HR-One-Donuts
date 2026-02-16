import Link from "next/link";
import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";

interface FooterProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
}

export default function Footer({ siteSettings }: FooterProps) {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand - Center on mobile */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <LogoBrand 
                logoUrl={siteSettings?.logo_url} 
                storeName={siteSettings?.store_name} 
                size="md"
              />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              {siteSettings?.tagline || "Freshly baked donuts delivered straight to your door with love."}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: 'photo_camera', label: 'Instagram', url: siteSettings?.instagram_url },
                { icon: 'videocam', label: 'TikTok', url: siteSettings?.tiktok_url },
              ].map((social, i) => social.url && (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm group"
                  aria-label={social.label}
                >
                  <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid - Clean side-by-side on mobile */}
          <div className="grid grid-cols-2 lg:contents gap-8 md:gap-4 p-6 md:p-0 bg-white md:bg-transparent rounded-2xl md:rounded-none border border-slate-100 md:border-none shadow-sm md:shadow-none">
            {/* Quick Links */}
            <div>
              <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] mb-5">Navigasi</h4>
              <ul className="space-y-3">
                {['/', '/catalog', '/news'].map((path) => (
                  <li key={path}>
                    <Link 
                      className="text-slate-500 hover:text-primary text-[13px] font-medium transition-colors flex items-center gap-2 group" 
                      href={path}
                    >
                      <span className="size-1 bg-slate-200 rounded-full group-hover:bg-primary transition-colors" />
                      {path === '/' ? 'Beranda' : path === '/catalog' ? 'Katalog' : 'Berita'}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] mb-5">Bantuan</h4>
              <ul className="space-y-3">
                {['FAQ', 'Pengiriman', 'Retur'].map((item) => (
                  <li key={item}>
                    <Link 
                      className="text-slate-500 hover:text-primary text-[13px] font-medium transition-colors flex items-center gap-2 group" 
                      href="#"
                    >
                      <span className="size-1 bg-slate-200 rounded-full group-hover:bg-primary transition-colors" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Informations - Highlighted Section */}
          <div className="space-y-6">
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] mb-2 text-center md:text-left">Informasi</h4>
            <div className="bg-white lg:bg-transparent p-6 lg:p-0 rounded-2xl border border-slate-100 lg:border-none shadow-sm lg:shadow-none space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Lokasi</span>
                  <span className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
                    {siteSettings?.address || "Jakarta, Indonesia"}
                  </span>
                </div>
              </div>

              <a href={`tel:${siteSettings?.phone_number}`} className="flex items-start gap-4 group">
                <div className="size-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                  <span className="material-symbols-outlined text-green-600 text-xl">call</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">WhatsApp</span>
                  <span className="text-slate-600 text-xs md:text-sm font-bold group-hover:text-primary transition-colors">
                    {siteSettings?.phone_number || "+62 812-3456-7890"}
                  </span>
                </div>
              </a>

              <a href="mailto:hello@hrone-donuts.com" className="flex items-start gap-4 group">
                <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <span className="material-symbols-outlined text-blue-600 text-xl">mail</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Email Kami</span>
                  <span className="text-slate-600 text-xs md:text-sm font-medium group-hover:text-primary transition-colors">
                    hello@hrone-donuts.com
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Minimal & Precise */}
        <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-semibold order-2 md:order-1">
            © 2025 {siteSettings?.store_name || "HR-One Donuts"}.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 order-1 md:order-2">
            {[
              { label: 'Privasi', href: '/privacy' },
              { label: 'Syarat', href: '/terms' },
              { label: 'Cookie', href: '/cookies' }
            ].map((link) => (
              <Link 
                key={link.href}
                className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] hover:text-primary transition-colors" 
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
