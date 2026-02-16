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
      <Navbar siteSettings={siteSettings} copy={copy} />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Kebijakan Privasi</h1>
          
          <div className="space-y-10 text-slate-600 leading-relaxed">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Informasi yang Kami Kumpulkan
              </h2>
              <p className="pl-11">
                Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat melakukan pemesanan, seperti nama, nomor WhatsApp, dan alamat pengiriman. Kami juga dapat mengumpulkan informasi teknis secara otomatis saat Anda mengunjungi website kami.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Penggunaan Informasi
              </h2>
              <p className="pl-11 mb-4">
                Informasi Anda digunakan secara eksklusif untuk:
              </p>
              <ul className="list-disc pl-16 space-y-2">
                <li>Memproses dan mengirimkan pesanan donat Anda.</li>
                <li>Menghubungi Anda melalui WhatsApp untuk konfirmasi pesanan atau status pengiriman.</li>
                <li>Meningkatkan layanan dan pengalaman belanja Anda di website kami.</li>
                <li>Kepentingan keamanan dan pencegahan penipuan.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                Perlindungan Data
              </h2>
              <p className="pl-11">
                Kami berkomitmen untuk menjaga keamanan data Anda. Kami menggunakan langkah-langkah teknis dan organisasi yang sesuai untuk melindungi informasi pribadi Anda dari akses yang tidak sah, perubahan, atau penghancuran.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">4</span>
                Berbagi dengan Pihak Ketiga
              </h2>
              <p className="pl-11">
                Kami tidak akan menjual, menyewakan, atau memberikan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran tanpa izin Anda. Kami hanya berbagi informasi dengan mitra logistik kami untuk memfasilitasi pengiriman pesanan Anda.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">5</span>
                Hak Anda
              </h2>
              <p className="pl-11">
                Anda memiliki hak untuk meminta akses ke informasi pribadi yang kami simpan tentang Anda, serta meminta koreksi atau penghapusan data tersebut jika diperlukan melalui kontak resmi kami.
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
