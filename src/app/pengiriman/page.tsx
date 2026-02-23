import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";
import { getCopy } from "@/lib/theme";
import Link from "next/link";

export default async function PengirimanPage() {
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
      <Navbar siteSettings={siteSettings} />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Informasi Pengiriman</h1>
          
          <div className="space-y-10 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">1</span>
                Cakupan Wilayah
              </h2>
              <p className="pl-11">
                Saat ini kami melayani pengiriman untuk seluruh wilayah {siteSettings?.address?.split(',')[0] || "Jakarta"} dan daerah sekitarnya. Kami bekerja sama dengan mitra kurir instan untuk memastikan donat sampai dalam kondisi terbaik.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">2</span>
                Jalur Pengiriman
              </h2>
              <p className="pl-11">
                Semua pesanan dikirim langsung dari outlet kami di <strong>{siteSettings?.address || "Jakarta"}</strong>. Kami menggunakan layanan ojek online (Grab/Gojek) instan atau same-day untuk menjaga tekstur donat agar tidak rusak.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">3</span>
                Biaya Pengiriman
              </h2>
              <p className="pl-11">
                Biaya pengiriman akan dihitung secara otomatis berdasarkan jarak tempuh dari lokasi outlet kami ke lokasi Anda. Detail biaya akan diinformasikan kembali saat konfirmasi pesanan melalui WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">4</span>
                Waktu Pengantaran
              </h2>
              <p className="pl-11">
                Pengiriman dilakukan setiap hari mulai pukul <strong>09.00 - 18.00 WIB</strong>. Estimasi waktu sampai tergantung pada layanan kurir yang dipilih (Instan: 1-2 jam, Same-day: 6-8 jam).
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-400 font-medium">
              Pastikan alamat dan titik GPS Anda sudah sesuai di map.
            </p>
            <Link 
              href="/catalog" 
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
            >
              Pesan Sekarang
            </Link>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
