import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 3600; // Cache for 1 hour
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/types/cms";
import { getCopy } from "@/lib/theme";
import Link from "next/link";

export default async function FAQPage() {
  const supabase = await createServerSupabaseClient();
  const copy = await getCopy();
  
  // Fetch site info
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = settingsData?.value as unknown as SiteSettings | undefined;

  const faqs = [
    {
      q: "Bagaimana cara memesan donat?",
      a: "Anda dapat memilih varian donat melalui Katalog kami, tambahkan ke keranjang, dan selesaikan pesanan. Pesanan akan diteruskan ke WhatsApp resmi kami untuk konfirmasi dan detail pembayaran."
    },
    {
      q: "Apakah donat ready stock setiap hari?",
      a: "Kami selalu berusaha menyediakan stok segar setiap hari. Namun, untuk memastikan varian favorit Anda tersedia, kami menyarankan untuk memesan di pagi hari atau melakukan pre-order H-1."
    },
    {
      q: "Apakah ada minimal pemesanan?",
      a: "Tidak ada minimal pemesanan untuk pembelian reguler. Namun, untuk beberapa promo paket (box), biasanya berlaku jumlah tertentu sesuai deskripsi produk."
    },
    {
      q: "Berapa lama donat dapat disimpan?",
      a: "Donat kami dibuat tanpa bahan pengawet. Untuk rasa terbaik, konsumsi di hari yang sama. Jika ingin disimpan, masukkan ke wadah kedap udara di suhu ruangan (1-2 hari) atau lemari es (3-4 hari)."
    },
    {
      q: "Bagaimana jika pesanan yang diterima rusak?",
      a: "Kami selalu memastikan pengemasan yang aman. Jika terjadi kerusakan saat pengiriman, silakan hubungi kami via WhatsApp dengan menyertakan foto produk saat baru diterima."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar siteSettings={siteSettings} />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">FAQ (Tanya Jawab)</h1>
          
          <div className="space-y-8">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-start gap-4">
                  <span className="shrink-0 size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">Q</span>
                  {faq.q}
                </h3>
                <div className="pl-12">
                  <p className="text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-400 font-medium">
              Punya pertanyaan lain? Hubungi kami via WhatsApp.
            </p>
            <Link 
              href="/catalog" 
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
            >
              Lihat Menu
            </Link>
          </div>
        </div>
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
