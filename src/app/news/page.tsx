import Link from "next/link";
import Navbar from "@/components/Navbar";

export const dynamic = 'force-dynamic';
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";

export default async function NewsPage() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch site info
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = settingsData?.value as unknown as SiteSettings | undefined;

  return (
    <div className="min-h-screen bg-white">
      <Navbar siteSettings={siteSettings} />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Berita & Promo</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
            Halaman ini sedang dalam pengembangan. Nantikan promo menarik dan berita terbaru dari HR-One Donuts di sini!
          </p>
          <Link 
            href="/catalog" 
            className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Lihat Katalog Menu
          </Link>
        </div>
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
