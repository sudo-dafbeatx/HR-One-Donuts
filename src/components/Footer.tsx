import Link from "next/link";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, CameraIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { SiteSettings } from "@/types/cms";

export default function Footer({ siteSettings }: { siteSettings?: SiteSettings }) {
  return (
    <footer className="bg-footer-bg border-t border-border px-4 md:px-20 lg:px-40 py-12 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="size-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-heading">{siteSettings?.store_name || "HR-One Donuts"}</h2>
          </div>
          <p className="text-subheading text-sm">
            {siteSettings?.tagline || "Resep tradisional yang menghadirkan kebahagiaan di setiap rumah sejak 2010."}
          </p>
        </div>
        <div>
          <h5 className="font-bold mb-4 text-heading">Link Cepat</h5>
          <ul className="flex flex-col gap-2 text-sm text-subheading">
            <li>
              <Link className="hover:text-primary transition-colors" href="/">
                Beranda
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="/catalog">
                Menu Katalog
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="/#about">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link className="hover:text-primary transition-colors" href="/#how-to-order">
                Cara Pesan
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-4 text-heading">Hubungi Kami</h5>
          <ul className="flex flex-col gap-2 text-sm text-subheading">
            <li className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" /> 
              <span>{siteSettings?.address || "Jakarta, Indonesia"}</span>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 shrink-0" /> 
              <span>{siteSettings?.phone_number || "+62 812-3456-7890"}</span>
            </li>
            <li className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 shrink-0" /> 
              <span>{siteSettings?.email || "halo@donatkeluarga.com"}</span>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-4 text-heading">Ikuti Kami</h5>
          <div className="flex gap-4">
            {siteSettings?.instagram_url && (
              <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#e7edf3] dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                <CameraIcon className="w-5 h-5" />
              </a>
            )}
            {siteSettings?.tiktok_url && (
              <a href={siteSettings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#e7edf3] dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                <VideoCameraIcon className="w-5 h-5" />
              </a>
            )}
            {!siteSettings?.instagram_url && !siteSettings?.tiktok_url && (
              <p className="text-xs text-slate-400 italic">Belum ada media sosial.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-[#e7edf3] dark:border-slate-800 text-center text-sm text-slate-500">
        © 2024 HR-One Donuts. Hak cipta dilindungi undang-undang. Dibuat dengan kasih sayang untuk keluarga Anda.
      </div>
    </footer>
  );
}
