import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";
import { getCopy } from "@/lib/theme";
import Link from "next/link";

export default async function KontakPage() {
  const supabase = await createServerSupabaseClient();
  const copy = await getCopy();
  
  // Fetch site info
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = settingsData?.value as unknown as SiteSettings | undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar siteSettings={siteSettings} copy={copy} />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Hubungi Kami</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-600 leading-relaxed">
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Lokasi Outlet
                </h2>
                <div className="pl-9 space-y-2">
                  <p className="font-bold text-slate-900">{siteSettings?.store_name || "HR-One Donuts"}</p>
                  <p>{siteSettings?.address || "Jakarta, Indonesia"}</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-500">chat</span>
                  WhatsApp
                </h2>
                <div className="pl-9">
                  <p className="mb-2">Admin kami siap membantu Anda:</p>
                  <a 
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || '62895351251395'}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-black text-slate-900 hover:text-primary transition-colors"
                  >
                    {process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || "+62 895-3512-51395"}
                  </a>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500">mail</span>
                  Email
                </h2>
                <div className="pl-9">
                  <a 
                    href={`mailto:${siteSettings?.email || 'hello@hrone-donuts.com'}`}
                    className="font-bold text-slate-900 hover:text-primary transition-colors"
                  >
                    {siteSettings?.email || 'hello@hrone-donuts.com'}
                  </a>
                </div>
              </section>
            </div>

            <div className="bg-primary/5 rounded-4xl p-8 md:p-10 border border-primary/10 flex flex-col justify-center text-center space-y-6">
              <span className="material-symbols-outlined text-6xl text-primary/40 block">volunteer_activism</span>
              <h3 className="text-xl font-bold text-slate-800">Saran & Kritik</h3>
              <p className="text-sm font-medium text-slate-500">
                Kami sangat menghargai feedback Anda untuk terus meningkatkan kualitas produk dan layanan kami.
              </p>
              <Link 
                href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || '62895351251395'}?text=Halo%20saya%20ingin%20memberikan%20saran`}
                target="_blank"
                className="w-full py-4 bg-white border-2 border-primary/20 text-primary font-black rounded-2xl hover:bg-primary hover:text-white hover:border-transparent transition-all"
              >
                Kirim Feedback
              </Link>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex justify-center">
            <Link 
              href="/" 
              className="text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
