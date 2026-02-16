import Link from "next/link";
import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";

interface FooterProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
}

export default function Footer({ siteSettings }: FooterProps) {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-10 md:pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand - Keep simple, center on mobile */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="flex items-center gap-3 mb-3">
              <LogoBrand 
                logoUrl={siteSettings?.logo_url} 
                storeName={siteSettings?.store_name} 
                size="md"
              />
            </Link>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 max-w-xs">
              {siteSettings?.tagline || "Freshly baked donuts delivered straight to your door with love."}
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'photo_camera', label: 'Instagram', url: siteSettings?.instagram_url },
                { icon: 'videocam', label: 'TikTok', url: siteSettings?.tiktok_url },
                { icon: 'share', label: 'Share', url: '#' },
              ].map((social, i) => social.url && (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="size-8 md:size-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined text-base md:text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 lg:contents gap-8">
            {/* Quick Links */}
            <div className="text-left">
              <h4 className="text-slate-900 font-bold text-[11px] md:text-sm uppercase tracking-widest mb-4">Navigasi</h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-slate-500">
                <li><Link className="hover:text-primary transition-colors" href="/">Beranda</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/catalog">Katalog</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/news">Berita</Link></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div className="text-left">
              <h4 className="text-slate-900 font-bold text-[11px] md:text-sm uppercase tracking-widest mb-4">Bantuan</h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-slate-500">
                <li><Link className="hover:text-primary transition-colors" href="#">FAQ</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Kirim</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Retur</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Us - Compact with icons on mobile */}
          <div className="text-center lg:text-left pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-200 lg:border-none">
            <h4 className="text-slate-900 font-bold text-[11px] md:text-sm uppercase tracking-widest mb-4 hidden lg:block">Kontak</h4>
            <div className="flex flex-row lg:flex-col items-center lg:items-start justify-center lg:justify-start gap-6 lg:space-y-4 text-xs md:text-sm text-slate-500">
              <div className="flex items-center gap-2 group cursor-help" title={siteSettings?.address || "Jakarta, Indonesia"}>
                <span className="material-symbols-outlined text-primary text-xl lg:text-2xl">location_on</span>
                <span className="hidden lg:block leading-snug">{siteSettings?.address || "Jakarta, Indonesia"}</span>
              </div>
              <a href={`tel:${siteSettings?.phone_number}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-xl lg:text-2xl">call</span>
                <span className="hidden lg:block font-medium">{siteSettings?.phone_number || "+62 812-3456-7890"}</span>
              </a>
              <a href="mailto:hello@hrone-donuts.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-xl lg:text-2xl">mail</span>
                <span className="hidden lg:block font-medium italic">Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-slate-400 text-[10px] md:text-xs font-medium">
            © 2025 {siteSettings?.store_name || "HR-One Donuts"}.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Link className="hover:text-primary transition-colors" href="/privacy">Privasi</Link>
            <Link className="hover:text-primary transition-colors" href="/terms">Syarat</Link>
            <Link className="hover:text-primary transition-colors" href="/cookies">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
