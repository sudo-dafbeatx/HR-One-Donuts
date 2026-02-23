import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 3600; // Cache for 1 hour
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";
import { getCopy } from "@/lib/theme";
import Link from "next/link";

export default async function CookiesPage() {
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Kebijakan Cookie</h1>
          
          <div className="space-y-10 text-slate-600 leading-relaxed">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Apa itu Cookie?
              </h2>
              <p className="pl-11">
                Cookie adalah file teks kecil yang disimpan di perangkat Anda (komputer atau ponsel) saat Anda mengunjungi sebuah website. Cookie membantu kami mengenali perangkat Anda dan menyimpan beberapa informasi tentang preferensi atau tindakan Anda di masa lalu.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Bagaimana Kami Menggunakan Cookie?
              </h2>
              <p className="pl-11 mb-4">
                Kami menggunakan cookie untuk memastikan Anda mendapatkan pengalaman terbaik di website {siteSettings?.store_name || "HR-One Donuts"}. Kegunaannya meliputi:
              </p>
              <ul className="list-disc pl-16 space-y-2">
                <li><strong>Sesi & Autentikasi:</strong> Untuk menjaga Anda tetap terlogin saat berpindah halaman.</li>
                <li><strong>Keranjang Belanja:</strong> Mengingat item yang telah Anda tambahkan ke keranjang.</li>
                <li><strong>Preferensi:</strong> Menyimpan pengaturan tampilan seperti mode gelap atau bahasa.</li>
                <li><strong>Analitik:</strong> Memahami bagaimana pengunjung menggunakan website kami agar kami dapat terus memperbaikinya.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                Jenis Cookie yang Kami Gunakan
              </h2>
              <div className="pl-11 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-700">Cookie Esensial</h3>
                  <p className="text-sm">Diperlukan agar website berfungsi dengan benar. Tanpa cookie ini, layanan seperti keranjang belanja tidak dapat diberikan.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700">Cookie Fungsional</h3>
                  <p className="text-sm">Digunakan untuk mengenali Anda saat kembali ke website kami dan mengingat pilihan yang Anda buat.</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700">Cookie Analitik</h3>
                  <p className="text-sm">Membantu kami menghitung jumlah pengunjung dan melihat bagaimana mereka bergerak di sekitar website.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">4</span>
                Mengontrol Cookie
              </h2>
              <p className="pl-11">
                Anda memiliki kendali penuh atas cookie. Sebagian besar browser memungkinkan Anda untuk menolak atau menghapus cookie melalui pengaturan browser mereka. Namun, harap dicatat bahwa menonaktifkan cookie dapat mempengaruhi fungsi beberapa bagian dari website kami.
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
