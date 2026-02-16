import Link from "next/link";
import { MapPinIcon, PhoneIcon, CameraIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { SiteSettings } from "@/types/cms";

export default function Footer({ siteSettings }: { siteSettings?: SiteSettings }) {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 px-4 md:px-8 py-8 md:py-12 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <h2 className="text-lg font-extrabold text-heading">{siteSettings?.store_name || "HR-One Donuts"}</h2>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
            {siteSettings?.tagline || "Fresh and Smooth donuts for your family."}
          </p>
        </div>
        
        <div>
          <h5 className="font-bold mb-3 text-slate-800 text-sm">Quick Links</h5>
          <ul className="flex flex-col gap-1.5 text-xs text-slate-500">
            <li><Link className="hover:text-primary transition-colors" href="/">Beranda</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/catalog">Menu Catalog</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold mb-3 text-slate-800 text-sm">Contact</h5>
          <ul className="flex flex-col gap-1.5 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
              <span>{siteSettings?.address || "Jakarta, Indonesia"}</span>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="w-3.5 h-3.5 shrink-0" /> 
              <span>{siteSettings?.phone_number || "+62 812-3456-7890"}</span>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold mb-3 text-slate-800 text-sm">Socials</h5>
          <div className="flex gap-2">
            {siteSettings?.instagram_url && (
              <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <CameraIcon className="w-4 h-4" />
              </a>
            )}
            {siteSettings?.tiktok_url && (
              <a href={siteSettings.tiktok_url} target="_blank" rel="noopener noreferrer" className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <VideoCameraIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200/50 text-center text-[10px] text-slate-400">
        © 2024 HR-One Donuts. All rights reserved.
      </div>
    </footer>
  );
}
