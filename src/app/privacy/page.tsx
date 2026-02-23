import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";
import { getCopy } from "@/lib/theme";
import Link from "next/link";

export default async function PrivacyPage() {
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Kebijakan Privasi</h1>
          
          <div className="space-y-10 text-slate-600 leading-relaxed">
            {/* Section 1 */}
            <section id="kebijakan-privasi">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Informasi yang Kami Kumpulkan
              </h2>
              <p className="pl-11">
                Website ini mengumpulkan data dasar seperti profil pengguna, email, dan alamat pengiriman semata-mata untuk mempermudah proses pemesanan dan pengantaran donat. Kami tidak menyimpan detail kartu kredit karena sistem kami menggunakan Payment Gateway bersertifikasi dari pihak ketiga.
              </p>
            </section>

            {/* Section 2 */}
            <section id="pengelolaan-data">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Penggunaan Data Anda
              </h2>
              <p className="pl-11 mb-4">
                Data Anda digunakan untuk memproses pesanan, mengirimkan notifikasi diskon (jika diaktifkan pada Pengaturan), dan mempermudah perhitungan ongkos kirim ke lokasi Anda. Kami menjamin bahwa:
              </p>
              <ul className="list-disc pl-16 space-y-2">
                <li>Data tidak diperjualbelikan kepada entitas luar manapun.</li>
                <li>Hanya admin pengiriman dan dapur HR-One yang memiliki akses ke detail alamat Anda.</li>
                <li>Anda bebas meminta penghapusan akun beserta semua history pesanannya kapan saja melalui menu Pengaturan &gt; Hapus Akun.</li>
              </ul>
            </section>

             {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                Kebijakan Cookies
              </h2>
              <p className="pl-11">
                Kami menggunakan _sessions_ (cookies) yang diamankan untuk mencegah pengguna tidak sah masuk ke akun Anda. Cookies ini otomatis musnah ketika Anda melakukan Logout secara rutin dari perangkat publik.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-400 italic">
              Terakhir diperbarui: 17 Februari 2026
            </p>
            <Link 
              href="/" 
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
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
