import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";
import { getCopy } from "@/lib/theme";
import Link from "next/link";

export default async function TermsPage() {
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Syarat & Ketentuan</h1>
          
          <div className="space-y-10 text-slate-600 leading-relaxed">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Ketentuan Umum
              </h2>
              <p className="pl-11">
                Selamat datang di {siteSettings?.store_name || "HR-One Donuts"}. Dengan mengakses dan melakukan pemesanan di website kami, Anda dianggap telah menyetujui syarat dan ketentuan yang berlaku. Kami berhak mengubah syarat ini sewaktu-waktu tanpa pemberitahuan sebelumnya.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Pemesanan & Pembayaran
              </h2>
              <ul className="list-disc pl-16 space-y-2">
                <li>Pemesanan dapat dilakukan melalui website dan diteruskan ke WhatsApp resmi kami.</li>
                <li>Semua harga yang tertera adalah harga nett kecuali disebutkan lain.</li>
                <li>Pembayaran dilakukan sesuai dengan metode yang disepakati melalui percakapan WhatsApp (Transfer Bank atau E-Wallet).</li>
                <li>Pesanan baru akan diproses setelah bukti pembayaran divalidasi oleh admin kami.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                Pengiriman
              </h2>
              <ul className="list-disc pl-16 space-y-2">
                <li>Kami melayani pengiriman untuk wilayah {siteSettings?.address?.split(',')[0] || "Jakarta"} dan sekitarnya.</li>
                <li>Biaya pengiriman ditentukan berdasarkan jarak dari outlet kami ke lokasi pengantaran.</li>
                <li>Waktu pengiriman adalah estimasi. Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh pihak ketiga atau kondisi luar biasa (cuaca, kemacetan parah).</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">4</span>
                Kualitas Produk
              </h2>
              <p className="pl-11">
                Donat kami dibuat segar setiap hari tanpa bahan pengawet. Kami merekomendasikan konsumsi di hari yang sama untuk rasa terbaik. Penyimpanan di tempat suhu ruangan yang sejuk atau lemari es dapat membantu menjaga tekstur donat.
              </p>
            </section>

            {/* Section 5 */}
            <section id="privacy">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">5</span>
                Kebijakan Privasi
              </h2>
              <p className="pl-11">
                Kami menghargai privasi Anda. Data pribadi yang Anda berikan (Nama, No. WhatsApp, Alamat) hanya digunakan untuk kepentingan proses pemesanan dan pengiriman. Kami tidak akan menjual atau menyalahgunakan data Anda kepada pihak ketiga manapun.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-400 italic">
              Terakhir diperbarui: 17 Februari 2026
            </p>
            <Link 
              href="/catalog" 
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
            >
              Kembali ke Menu
            </Link>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
