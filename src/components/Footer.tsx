import Link from "next/link";
import NextImage from "next/image";
import { SiteSettings } from "@/types/cms";

interface FooterProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
}

export default function Footer({ siteSettings }: FooterProps) {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {siteSettings?.logo_url ? (
                <div className="relative h-12 w-auto aspect-square">
                  <NextImage 
                    src={siteSettings.logo_url}
                    alt={siteSettings?.store_name || "HR-One Donuts"}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <>
                  <div className="size-8 bg-primary rounded-full flex items-center justify-center text-white shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-lg font-bold">donut_large</span>
                  </div>
                  <span className="font-display text-lg font-black text-primary tracking-tight">
                    {siteSettings?.store_name || "HR-One Donuts"}
                  </span>
                </>
              )}
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              {siteSettings?.tagline || "Freshly baked donuts delivered straight to your door with love."}
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'photo_camera', label: 'Instagram', url: siteSettings?.instagram_url },
                { icon: 'videocam', label: 'TikTok', url: siteSettings?.tiktok_url },
                { icon: 'share', label: 'Share', url: '#' },
              ].map((social, i) => social.url && (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="size-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <span className="material-symbols-outlined text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">Navigasi</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-primary transition-colors" href="/">Beranda</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/catalog">Katalog Menu</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/news">Berita & Promo</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="text-center sm:text-left">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">Bantuan</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link className="hover:text-primary transition-colors" href="#">Pusat Bantuan</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="#">Info Pengiriman</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="#">Kebijakan Pengembalian</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="text-center sm:text-left">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">Kontak</h4>
            <div className="space-y-4 text-sm text-slate-500">
              <div className="flex items-start justify-center sm:justify-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">location_on</span>
                <span className="leading-snug">{siteSettings?.address || "Jakarta, Indonesia"}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">call</span>
                <span className="font-medium">{siteSettings?.phone_number || "+62 812-3456-7890"}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">mail</span>
                <span className="font-medium">hello@hrone-donuts.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-slate-400 text-xs font-medium">
            © 2025 {siteSettings?.store_name || "HR-One Donuts"}. Semua hak dilindungi.
          </p>
          <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <a className="hover:text-primary transition-colors" href="#">Privasi</a>
            <a className="hover:text-primary transition-colors" href="#">Syarat</a>
            <a className="hover:text-primary transition-colors" href="#">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
