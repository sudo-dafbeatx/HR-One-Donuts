import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderSteps from "@/components/OrderSteps";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings, OrderStep } from "@/types/cms";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";

export default async function CaraPesanPage() {
  const supabase = await createServerSupabaseClient();
  
  // 1. Fetch site info
  const { data: siteInfoData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteSettings = siteInfoData?.value as unknown as SiteSettings | undefined;

  // 2. Fetch order steps from CMS
  const { data: orderStepsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'order_steps')
    .maybeSingle();
  
  const orderSteps = (orderStepsData?.value as unknown as { steps: OrderStep[] } | null)?.steps;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark uiverse-bg overflow-hidden">
      <Navbar siteSettings={siteSettings} />
      
      <main className="flex-1 w-full flex flex-col items-center">
        {/* Header Section */}
        <section className="w-full pt-16 pb-12 md:pt-24 md:pb-20 bg-slate-50/50 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Cara Pesan di <span className="text-primary">HR-One Donuts</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Ikuti langkah-langkah mudah berikut untuk memesan donat artisan favorit Anda dan nikmati kelezatannya bersama keluarga.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <div className="w-full max-w-5xl py-12 md:py-20">
          <OrderSteps steps={orderSteps} />
        </div>

        {/* CTA Section */}
        <section className="w-full max-w-5xl px-6 pb-20 md:pb-32">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Background Grain/Blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] z-0" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Sudah Siap untuk Memilih Donat Anda?
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
                Eksplorasi katalog kami sekarang dan temukan berbagai varian rasa donat yang menggugah selera.
              </p>
              <div className="flex justify-center">
                <Link 
                  href="/catalog" 
                  className="group flex h-16 px-10 bg-primary text-white font-black rounded-2xl text-lg items-center justify-center gap-3 shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <ShoppingBagIcon className="size-6 transition-transform group-hover:-translate-y-0.5" />
                  Mulai Belanja
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer siteSettings={siteSettings} />
      {/* Mobile Safe Area Padding Wrapper */}
      <div className="md:hidden h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
}
