'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";
import { useTranslation } from "@/context/LanguageContext";

interface FooterProps {
  siteSettings?: SiteSettings;
}

export default function Footer({ siteSettings }: FooterProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  if (pathname && (pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname.startsWith('/cookies'))) {
    return null;
  }
  
  return (
    <footer className="hidden md:block bg-zinc-50 text-center text-surface/75 dark:bg-neutral-700 dark:text-white/75 lg:text-left">
      <div className="flex items-center justify-center border-b-2 border-neutral-200 p-6 dark:border-white/10 lg:justify-between">
        <div className="me-12 hidden lg:block">
          <span>{t('footer.social_connect') || 'Get connected with us on social networks:'}</span>
        </div>
        <div className="flex justify-center">
          {siteSettings?.instagram_url && (
             <a href={siteSettings.instagram_url} className="me-6 [&>svg]:h-4 [&>svg]:w-4" target="_blank" rel="noopener noreferrer">
                {/* Instagram Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
             </a>
          )}
          {siteSettings?.tiktok_url && (
            <a href={siteSettings.tiktok_url} className="[&>svg]:h-4 [&>svg]:w-4" target="_blank" rel="noopener noreferrer">
              {/* Tiktok Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512">
                <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="mx-6 py-10 text-center md:text-left">
        <div className="grid-1 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center md:items-start">
            <h6 className="mb-4 flex items-center justify-center font-semibold uppercase md:justify-start">
              {siteSettings?.store_name || 'HR-One Donuts'}
            </h6>
            <div className="mb-4 mt-2 scale-90 md:scale-100 origin-center md:origin-left inline-block bg-slate-900 p-2 rounded-2xl shadow-lg">
               <LogoBrand logoUrl={siteSettings?.logo_url} storeName={siteSettings?.store_name} size="sm" />
            </div>
            <p className="text-sm">
              {siteSettings?.tagline || t('footer.tagline') || 'Menyediakan donut berkualitas dengan rasa yang tak terlupakan. Dibuat dengan cinta setiap hari.'}
            </p>
          </div>
          <div>
            <h6 className="mb-4 flex justify-center font-semibold uppercase md:justify-start">
              {t('footer.navigation') || 'Products'}
            </h6>
            <p className="mb-4">
              <Link href="/" className="hover:text-primary transition-colors">{t('nav.home') || 'Home'}</Link>
            </p>
            <p className="mb-4">
               <Link href="/catalog" className="hover:text-primary transition-colors">{t('nav.catalog') || 'Catalog'}</Link>
            </p>
            <p className="mb-4">
               <Link href="/news" className="hover:text-primary transition-colors">{t('nav.events') || 'News'}</Link>
            </p>
            <p>
               <Link href="/promo/birthday" className="hover:text-primary transition-colors">{t('nav.promo') || 'Promo'}</Link>
            </p>
          </div>
          <div>
            <h6 className="mb-4 flex justify-center font-semibold uppercase md:justify-start">
              {t('footer.help') || 'Useful links'}
            </h6>
            <p className="mb-4">
              <Link href="/cara-pesan" className="hover:text-primary transition-colors">{t('nav.how_to_order') || 'Cara Pesan'}</Link>
            </p>
            <p className="mb-4">
               <Link href="/faq" className="hover:text-primary transition-colors">{t('nav.faq') || 'FAQ'}</Link>
            </p>
            <p className="mb-4">
               <Link href="/pengiriman" className="hover:text-primary transition-colors">Pengiriman</Link>
            </p>
            <p>
               <Link href="/kontak" className="hover:text-primary transition-colors">{t('nav.contact') || 'Kontak'}</Link>
            </p>
          </div>
          <div>
            <h6 className="mb-4 flex justify-center font-semibold uppercase md:justify-start">
              {t('footer.contact_us') || 'Contact'}
            </h6>
            <div className="mb-4 flex items-start justify-center md:justify-start text-sm">
              <span className="me-3 [&>svg]:h-5 [&>svg]:w-5 shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </span>
              <span className="text-center md:text-left">{siteSettings?.address || "Jakarta, Indonesia"}</span>
            </div>
            <div className="mb-4 flexItems-center justify-center md:justify-start text-sm">
              <span className="me-3 [&>svg]:h-5 [&>svg]:w-5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </span>
              <span>{siteSettings?.email || 'heri.irawan.hr1@gmail.com'}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start text-sm">
              <span className="me-3 [&>svg]:h-5 [&>svg]:w-5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
              </span>
              <span>+{process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || "6285810658117"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/5 p-6 text-center text-sm flex flex-col md:flex-row justify-center items-center gap-4">
        <span>© {new Date().getFullYear()} {t('footer.copyright') || 'Hak Cipta Dilindungi'}.</span>
        <span className="font-semibold block md:inline">
          {siteSettings?.store_name || 'HR-One Donuts'}
        </span>
        <div className="flex gap-4 md:ml-auto">
           <Link href="/privacy" className="hover:text-primary transition-colors text-xs">{t('footer.privacy') || 'Privacy'}</Link>
           <Link href="/terms" className="hover:text-primary transition-colors text-xs">{t('footer.terms') || 'Terms'}</Link>
           <Link href="/cookies" className="hover:text-primary transition-colors text-xs">{t('footer.cookie') || 'Cookies'}</Link>
        </div>
      </div>
    </footer>
  );
}
