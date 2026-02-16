import Link from "next/link";
import { SiteSettings } from "@/types/cms";
import { DEFAULT_COPY } from "@/lib/theme-defaults";

interface FooterProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
}

export default function Footer({ siteSettings, copy: _copy }: FooterProps) {
  const copy = _copy || DEFAULT_COPY;
  return (
    <footer className="bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-10 pb-6">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4 md:mb-6">
            <div className="size-8 bg-primary rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">donut_large</span>
            </div>
            <span className="font-display text-lg md:text-xl font-extrabold text-primary">
              {siteSettings?.store_name || copy.hero_title}
            </span>
          </div>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-xs">
            {siteSettings?.tagline || copy.hero_subtitle}
          </p>
          <div className="flex gap-3">
            {siteSettings?.instagram_url && (
              <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="size-9 md:size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">photo_camera</span>
              </a>
            )}
            {siteSettings?.tiktok_url && (
              <a href={siteSettings.tiktok_url} target="_blank" rel="noopener noreferrer" className="size-9 md:size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-lg">videocam</span>
              </a>
            )}
            <a href="#" className="size-9 md:size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined text-lg">share</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="font-bold mb-4 md:mb-6 text-sm">{copy.footer_quicklinks}</h5>
          <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
            <li><Link className="hover:text-primary transition-colors" href="/">Beranda</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/catalog">Katalog Menu</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/news">Berita</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h5 className="font-bold mb-4 md:mb-6 text-sm">{copy.footer_support}</h5>
          <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
            <li><Link className="hover:text-primary transition-colors" href="#">Help Center</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Shipping Info</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h5 className="font-bold mb-4 md:mb-6 text-sm">{copy.footer_contact}</h5>
          <div className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-500">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg shrink-0">location_on</span>
              <span>{siteSettings?.address || "Jakarta, Indonesia"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg shrink-0">call</span>
              <span>{siteSettings?.phone_number || "+62 812-3456-7890"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-lg shrink-0">mail</span>
              <span>hello@hrone-donuts.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 border-t border-slate-100 dark:border-slate-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-[10px] md:text-xs text-slate-400">
        <p>{copy.footer_copyright}</p>
        <div className="flex gap-4 md:gap-6">
          <a className="hover:text-slate-600" href="#">Privacy Policy</a>
          <a className="hover:text-slate-600" href="#">Terms of Service</a>
          <a className="hover:text-slate-600" href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
